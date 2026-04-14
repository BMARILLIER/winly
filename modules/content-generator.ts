import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/stripe";

export type QuotaResult =
  | { ok: true; remaining: number }
  | { ok: false; error: string };

/**
 * Verifies and increments the generation quota for a user.
 * FREE plan: capped at PLANS.FREE.generationsLimit per month.
 * PRO plan: unlimited.
 *
 * The counter resets monthly via `generationsReset` (first access each month
 * after the stored date resets the counter).
 */
export async function checkAndConsumeGeneration(userId: string): Promise<QuotaResult> {
  const user = await prisma.user.findUnique({
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

  if (user.plan === "free" && used >= PLANS.FREE.generationsLimit) {
    return { ok: false, error: "Limite atteinte, passe en PRO" };
  }

  const nextReset = needsReset
    ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    : user.generationsReset!;

  await prisma.user.update({
    where: { id: userId },
    data: {
      generationsUsed: used + 1,
      generationsReset: nextReset,
    },
  });

  const limit =
    user.plan === "free" ? PLANS.FREE.generationsLimit : Number.POSITIVE_INFINITY;
  return { ok: true, remaining: Math.max(0, limit - (used + 1)) };
}
