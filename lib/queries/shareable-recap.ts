import { prisma } from "@/lib/db";
import { getActiveConnection } from "@/lib/services/instagram-connection";

export interface ShareableRecap {
  hasData: boolean;
  username: string | null;
  period: "week" | "month";
  periodLabel: string;
  followers: number | null;
  followersDelta: number | null;
  engagementRate: string | null;
  topPostLikes: number | null;
  postsCount: number;
  totalLikes: number;
  totalComments: number;
  streakDays: number;
  level: number;
  badgesUnlocked: number;
  badgesTotal: number;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getShareableRecap(
  userId: string,
  period: "week" | "month" = "week",
): Promise<ShareableRecap> {
  const connection = await getActiveConnection(userId);

  const empty: ShareableRecap = {
    hasData: false,
    username: null,
    period,
    periodLabel: period === "week" ? "Cette semaine" : "Ce mois",
    followers: null,
    followersDelta: null,
    engagementRate: null,
    topPostLikes: null,
    postsCount: 0,
    totalLikes: 0,
    totalComments: 0,
    streakDays: 0,
    level: 1,
    badgesUnlocked: 0,
    badgesTotal: 18,
  };

  if (!connection) return empty;

  const sinceMs = period === "week" ? WEEK_MS : 30 * 24 * 60 * 60 * 1000;
  const since = new Date(Date.now() - sinceMs);

  const [snapshots, media, workspaces] = await Promise.all([
    prisma.instagramSnapshot.findMany({
      where: { connectionId: connection.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.instagramMedia.findMany({
      where: { connectionId: connection.id, timestamp: { gte: since } },
    }),
    prisma.workspace.findMany({
      where: { userId },
      select: { id: true },
    }),
  ]);

  const latestSnap = snapshots[0];
  const oldSnap = snapshots.find((s) => s.createdAt <= since);

  const followers = latestSnap?.followers ?? null;
  const followersDelta =
    followers != null && oldSnap?.followers != null
      ? followers - oldSnap.followers
      : null;

  const totalLikes = media.reduce((s, m) => s + m.likeCount, 0);
  const totalComments = media.reduce((s, m) => s + m.commentsCount, 0);
  const topPostLikes = media.length > 0 ? Math.max(...media.map((m) => m.likeCount)) : null;

  const engagementRate =
    followers && followers > 0 && media.length > 0
      ? (((totalLikes + totalComments) / media.length / followers) * 100).toFixed(1)
      : null;

  // Streak + level
  let streakDays = 0;
  let level = 1;
  if (workspaces.length > 0) {
    const completions = await prisma.missionCompletion.findMany({
      where: { workspaceId: { in: workspaces.map((w) => w.id) } },
      select: { xp: true, date: true },
      orderBy: { date: "desc" },
    });
    const totalXp = completions.reduce((s, c) => s + c.xp, 0);
    level = Math.max(1, Math.floor(totalXp / 100) + 1);

    const dates = Array.from(new Set(completions.map((c) => c.date)));
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const dateSet = new Set(dates);
    let cursor = dateSet.has(today) ? new Date() : dateSet.has(yesterday) ? new Date(Date.now() - 86400000) : null;
    if (cursor) {
      while (dateSet.has(cursor.toISOString().slice(0, 10))) {
        streakDays++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      }
    }
  }

  return {
    hasData: true,
    username: connection.igUsername,
    period,
    periodLabel: period === "week" ? "Cette semaine" : "Ce mois",
    followers,
    followersDelta,
    engagementRate,
    topPostLikes,
    postsCount: media.length,
    totalLikes,
    totalComments,
    streakDays,
    level,
    badgesUnlocked: 0, // will be computed client-side
    badgesTotal: 18,
  };
}
