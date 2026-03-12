"use server";

import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "./admin-log";
import { revalidatePath } from "next/cache";
import { BETA_MAX_USERS } from "@/lib/config";
import { sendEmail } from "@/lib/services/email";

// ─── Schemas ───

const betaEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Veuillez entrer une adresse email valide."),
});

const betaRequestIdSchema = z.object({
  requestId: z.string().min(1, "L'identifiant est requis."),
});

// ─── Public: Waitlist Signup ───

export type BetaState = { error?: string; success?: string } | null;

export async function requestBetaAccess(
  _prev: BetaState,
  formData: FormData
): Promise<BetaState> {
  const parsed = betaEmailSchema.safeParse({
    email: formData.get("email") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email } = parsed.data;

  const existing = await prisma.betaRequest.findUnique({ where: { email } });
  if (existing) {
    if (existing.status === "approved") {
      return { success: "Votre accès est déjà approuvé ! Vous pouvez créer votre compte." };
    }
    if (existing.status === "pending") {
      return { success: "Vous êtes déjà sur la liste d'attente. Nous vous informerons dès que votre accès sera validé." };
    }
    return { error: "Cet email a déjà été examiné. Contactez le support pour plus d'informations." };
  }

  await prisma.betaRequest.create({ data: { email } });

  return { success: "Vous avez été ajouté à la liste d'attente ! Nous examinerons votre demande rapidement." };
}

// ─── Public: Check beta approval ───

export async function isBetaApproved(email: string): Promise<boolean> {
  const request = await prisma.betaRequest.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { status: true },
  });
  return request?.status === "approved";
}

// ─── Public: Validate invite token ───

export async function validateInviteToken(
  token: string
): Promise<{ valid: boolean; email?: string }> {
  try {
    const request = await prisma.betaRequest.findUnique({
      where: { inviteToken: token },
      select: { email: true, status: true },
    });
    if (!request || request.status !== "approved") {
      return { valid: false };
    }
    return { valid: true, email: request.email };
  } catch (error) {
    console.error("[beta/validateInvite]", error);
    return { valid: false };
  }
}

// ─── Admin: Get all requests ───

export async function getBetaRequests() {
  return prisma.betaRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getBetaStats() {
  const [total, approved, pending, rejected] = await Promise.all([
    prisma.betaRequest.count(),
    prisma.betaRequest.count({ where: { status: "approved" } }),
    prisma.betaRequest.count({ where: { status: "pending" } }),
    prisma.betaRequest.count({ where: { status: "rejected" } }),
  ]);
  return { total, approved, pending, rejected, limit: BETA_MAX_USERS, remaining: BETA_MAX_USERS - approved };
}

// ─── Helpers ───

function generateInviteToken(): string {
  return randomBytes(32).toString("hex");
}

function buildInviteLink(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/register?invite=${token}`;
}

async function sendBetaInviteEmail(
  email: string,
  inviteLink: string
): Promise<boolean> {
  const result = await sendEmail({
    to: email,
    subject: "Votre accès bêta Winly est activé",
    text: `Bonjour,

Votre accès à la bêta privée de Winly est activé.

Vous pouvez créer votre compte ici :
${inviteLink}

Winly vous permet d'analyser votre croissance, évaluer vos contenus et explorer votre potentiel de collaboration.

Merci de tester la bêta.

À bientôt,
Barbara

PS : Si vous ne trouvez pas cet email, pensez à vérifier votre dossier Spam ou Indésirables.`,
  });
  return result.sent;
}

// ─── Admin: Approve ───

export async function approveBetaRequest(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = betaRequestIdSchema.safeParse({
    requestId: formData.get("requestId") ?? "",
  });
  if (!parsed.success) return;
  const { requestId } = parsed.data;

  // Check limit
  const approvedCount = await prisma.betaRequest.count({ where: { status: "approved" } });
  if (approvedCount >= BETA_MAX_USERS) return;

  const token = generateInviteToken();
  const request = await prisma.betaRequest.update({
    where: { id: requestId },
    data: {
      status: "approved",
      inviteToken: token,
      approvedAt: new Date(),
    },
  });

  const inviteLink = buildInviteLink(token);
  const emailSent = await sendBetaInviteEmail(request.email, inviteLink);

  if (!emailSent) {
    console.warn(
      `[beta/approve] Email non envoyé — lien d'invitation pour ${request.email} :\n→ ${inviteLink}`
    );
  }

  if (emailSent) {
    await prisma.betaRequest.update({
      where: { id: requestId },
      data: { inviteSentAt: new Date() },
    });
  }

  await logAdminAction(admin.id, "beta.approve", requestId, {
    email: request.email,
    emailSent,
  });
  revalidatePath("/admin/beta");
}

// ─── Admin: Reject ───

export async function rejectBetaRequest(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = betaRequestIdSchema.safeParse({
    requestId: formData.get("requestId") ?? "",
  });
  if (!parsed.success) return;
  const { requestId } = parsed.data;

  const request = await prisma.betaRequest.update({
    where: { id: requestId },
    data: { status: "rejected" },
  });

  await logAdminAction(admin.id, "beta.reject", requestId, { email: request.email });
  revalidatePath("/admin/beta");
}

// ─── Admin: Revoke ───

export async function revokeBetaAccess(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = betaRequestIdSchema.safeParse({
    requestId: formData.get("requestId") ?? "",
  });
  if (!parsed.success) return;
  const { requestId } = parsed.data;

  const request = await prisma.betaRequest.update({
    where: { id: requestId },
    data: { status: "rejected" },
  });

  await logAdminAction(admin.id, "beta.revoke", requestId, { email: request.email });
  revalidatePath("/admin/beta");
}

// ─── Admin: Delete ───

export async function deleteBetaRequest(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = betaRequestIdSchema.safeParse({
    requestId: formData.get("requestId") ?? "",
  });
  if (!parsed.success) return;
  const { requestId } = parsed.data;

  const request = await prisma.betaRequest.delete({
    where: { id: requestId },
  });

  await logAdminAction(admin.id, "beta.delete", requestId, { email: request.email });
  revalidatePath("/admin/beta");
}
