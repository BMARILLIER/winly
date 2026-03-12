"use server";

import { z } from "zod";
import { hash, compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setSession, clearSession } from "@/lib/auth";
import { FEATURES } from "@/lib/config";
import { isBetaApproved } from "./beta";

const registerSchema = z.object({
  name: z.string().nullable(),
  email: z.string().trim().toLowerCase().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

export type AuthState = { error?: string } | null;

export async function register(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
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
      return { error: "Winly is currently in private beta. Please join the waitlist at /beta to request access." };
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, name: name || null },
  });

  await setSession(user.id, user.role);
  redirect("/onboarding");
}

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
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
    return { error: "Invalid email or password." };
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await setSession(user.id, user.role);
  redirect(user.workspaces.length > 0 ? "/dashboard" : "/onboarding");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
