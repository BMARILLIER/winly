"use server";

import { z } from "zod";
import { hash, compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setSession, clearSession } from "@/lib/auth";
import { FEATURES } from "@/lib/config";
import { isBetaApproved } from "./beta";
import { loginLimiter, registerLimiter, getClientIp } from "@/lib/rate-limit";

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

  await setSession(user.id, user.role);
  redirect("/onboarding");
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
