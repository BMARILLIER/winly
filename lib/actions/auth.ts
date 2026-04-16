"use server";

import { randomBytes, createHash } from "crypto";
import { z } from "zod";
import { hash, compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setSession, clearSession } from "@/lib/auth";
import { FEATURES } from "@/lib/config";
import { isBetaApproved } from "./beta";
import { loginLimiter, registerLimiter, getClientIp } from "@/lib/rate-limit";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "@/lib/services/email";

// ── Password policy ──

const PASSWORD_MIN = 8;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).+$/;

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Le mot de passe doit contenir au moins ${PASSWORD_MIN} caractères.`)
  .refine((pw) => PASSWORD_REGEX.test(pw), {
    message: "Le mot de passe doit contenir au moins une lettre et un chiffre.",
  });

// ── Schemas ──

const registerSchema = z.object({
  name: z.string().nullable(),
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  password: passwordSchema,
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export type AuthState = { error?: string } | null;

// ── Register ──

export async function register(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  // Rate limit
  const ip = await getClientIp();
  const rl = registerLimiter.check(ip);
  if (!rl.success) {
    return { error: "Trop de tentatives. Veuillez réessayer dans quelques minutes." };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name") ?? null,
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  // Beta gate: only approved emails can register
  if (FEATURES.BETA_ENABLED) {
    const approved = await isBetaApproved(email);
    if (!approved) {
      return {
        error:
          "Winly est en bêta privée. Rejoignez la liste d'attente sur /beta pour demander un accès.",
      };
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte avec cet email existe déjà." };
  }

  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, name: name || null },
  });

  // Fire-and-forget welcome email (ne bloque pas l'inscription si SMTP down)
  sendWelcomeEmail(user.email, user.name).catch((err) =>
    console.error("[auth] welcome email failed:", err),
  );

  // Apply referral code if present
  const refCode = formData.get("referralCode") as string | null;
  if (refCode?.trim()) {
    import("@/lib/services/referral")
      .then(({ applyReferralCode }) => applyReferralCode(user.id, refCode.trim()))
      .catch((err) => console.error("[auth] referral failed:", err));
  }

  await setSession(user.id, user.role);
  redirect("/onboarding");
}

// ── Password reset ──

const requestResetSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
});

const resetPasswordSchema = z.object({
  token: z.string().min(20, "Token invalide."),
  password: passwordSchema,
});

export type ResetState = { error?: string; success?: boolean } | null;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const ip = await getClientIp();
  const rl = registerLimiter.check(ip);
  if (!rl.success) {
    return { error: "Trop de tentatives. Réessayez plus tard." };
  }

  const parsed = requestResetSchema.safeParse({
    email: formData.get("email") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Réponse constante pour ne pas révéler si l'email existe
  if (user) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, resetUrl).catch((err) =>
      console.error("[auth] reset email failed:", err),
    );
  }

  return { success: true };
}

export async function resetPassword(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token") ?? "",
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { token, password } = parsed.data;
  const tokenHash = hashToken(token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "Lien invalide ou expiré." };
  }

  const passwordHash = await hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true };
}

// ── Login ──

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  // Rate limit
  const ip = await getClientIp();
  const rl = loginLimiter.check(ip);
  if (!rl.success) {
    return { error: "Trop de tentatives. Veuillez réessayer dans quelques minutes." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { workspaces: { select: { id: true }, take: 1 } },
  });
  if (!user) {
    return { error: "Email ou mot de passe invalide." };
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Email ou mot de passe invalide." };
  }

  await setSession(user.id, user.role);
  redirect(user.workspaces.length > 0 ? "/dashboard" : "/onboarding");
}

// ── Logout ──

export async function logout() {
  await clearSession();
  redirect("/login");
}
