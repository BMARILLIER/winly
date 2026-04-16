"use server";

import { getCurrentUser } from "@/lib/auth";
import { getReferralStats, applyReferralCode } from "@/lib/services/referral";

export async function getMyReferralStats() {
  const user = await getCurrentUser();
  if (!user) return { code: "", totalReferred: 0, creditsEarned: 0 };
  return getReferralStats(user.id);
}

export async function submitReferralCode(code: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non authentifie." };
  return applyReferralCode(user.id, code);
}
