"use server";

import { getCurrentUser } from "@/lib/auth";
import { getShareableRecap, type ShareableRecap } from "@/lib/queries/shareable-recap";

export type { ShareableRecap };

export async function fetchRecap(period: "week" | "month" = "week"): Promise<ShareableRecap> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      hasData: false, username: null, period, periodLabel: "Cette semaine",
      followers: null, followersDelta: null, engagementRate: null,
      topPostLikes: null, postsCount: 0, totalLikes: 0, totalComments: 0,
      streakDays: 0, level: 1, badgesUnlocked: 0, badgesTotal: 18,
    };
  }
  return getShareableRecap(user.id, period);
}
