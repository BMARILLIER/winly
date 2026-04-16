import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/stripe";

export type QuotaResult =
  | { ok: true; remaining: number }
  | { ok: false; error: string };

function getPlanLimit(plan: string): number {
  if (plan === "pro") return PLANS.PRO.generationsLimit;
  return PLANS.FREE.generationsLimit;
}

/**
 * Verifies and increments the AI generation quota for a user.
 * FREE plan: 10 credits/month.
 * PRO plan: 200 credits/month.
 *
 * The counter resets monthly via `generationsReset`.
 * Used by ALL user-initiated AI features (content, viral score,
 * competitor analysis, comments AI, bio, hooks, hashtags).
 * NOT used by system crons (weekly digest, daily mission).
 */
export async function checkAndConsumeGeneration(userId: string): Promise<QuotaResult> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        generationsUsed: true,
        generationsReset: true,
      },
    });

    if (!user) return { ok: false, error: "Utilisateur introuvable." };

    const now = new Date();
    const needsReset =
      !user.generationsReset ||
      user.generationsReset.getUTCFullYear() !== now.getUTCFullYear() ||
      user.generationsReset.getUTCMonth() !== now.getUTCMonth();

    let used = user.generationsUsed;
    if (needsReset) used = 0;

    const limit = getPlanLimit(user.plan);

    if (used >= limit) {
      const planLabel = user.plan === "free" ? "Free (10/mois)" : "Pro (200/mois)";
      return {
        ok: false,
        error: `Limite de crédits IA atteinte (${planLabel}). ${user.plan === "free" ? "Passe en Pro pour 200 crédits/mois." : "Tes crédits se renouvellent le 1er du mois."}`,
      };
    }

    const nextReset = needsReset
      ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
      : user.generationsReset!;

    await tx.user.update({
      where: { id: userId },
      data: {
        generationsUsed: used + 1,
        generationsReset: nextReset,
      },
    });

    return { ok: true, remaining: Math.max(0, limit - (used + 1)) };
  });
}

/**
 * Read-only: get current quota status without consuming a credit.
 */
export async function getQuotaStatus(userId: string): Promise<{
  used: number;
  limit: number;
  remaining: number;
  plan: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, generationsUsed: true, generationsReset: true },
  });

  if (!user) return { used: 0, limit: 0, remaining: 0, plan: "free" };

  const now = new Date();
  const needsReset =
    !user.generationsReset ||
    user.generationsReset.getUTCFullYear() !== now.getUTCFullYear() ||
    user.generationsReset.getUTCMonth() !== now.getUTCMonth();

  const used = needsReset ? 0 : user.generationsUsed;
  const limit = getPlanLimit(user.plan);

  return { used, limit, remaining: Math.max(0, limit - used), plan: user.plan };
}
