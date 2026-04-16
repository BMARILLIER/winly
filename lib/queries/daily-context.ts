import { prisma } from "@/lib/db";
import { getActiveConnection } from "@/lib/services/instagram-connection";
import type { DailyMissionContext } from "@/lib/services/daily-mission-ai";

export async function getDailyContext(userId: string): Promise<DailyMissionContext> {
  const workspace = await prisma.workspace.findFirst({
    where: { userId },
    select: { niche: true },
  });

  const connection = await getActiveConnection(userId);

  if (!connection) {
    return {
      niche: workspace?.niche ?? null,
      followers: null,
      postedYesterday: false,
      postsLast7Days: 0,
      avgEngagement: null,
      bestFormat: null,
      streakDays: 0,
    };
  }

  const now = Date.now();
  const yesterdayStart = new Date(now - 2 * 24 * 60 * 60 * 1000);
  const yesterdayEnd = new Date(now - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const [latestSnap, yesterdayPosts, last7Media] = await Promise.all([
    prisma.instagramSnapshot.findFirst({
      where: { connectionId: connection.id },
      orderBy: { createdAt: "desc" },
      select: { followers: true },
    }),
    prisma.instagramMedia.count({
      where: {
        connectionId: connection.id,
        timestamp: { gte: yesterdayStart, lt: yesterdayEnd },
      },
    }),
    prisma.instagramMedia.findMany({
      where: { connectionId: connection.id, timestamp: { gte: sevenDaysAgo } },
    }),
  ]);

  const avgEngagement =
    last7Media.length > 0
      ? Math.round(
          last7Media.reduce((s, m) => s + m.likeCount + m.commentsCount, 0) /
            last7Media.length,
        )
      : null;

  const byType = new Map<string, { count: number; engagement: number }>();
  for (const m of last7Media) {
    const cur = byType.get(m.mediaType) ?? { count: 0, engagement: 0 };
    cur.count += 1;
    cur.engagement += m.likeCount + m.commentsCount;
    byType.set(m.mediaType, cur);
  }
  let bestFormat: string | null = null;
  let bestAvg = 0;
  for (const [type, s] of byType.entries()) {
    const avg = s.engagement / s.count;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestFormat = type;
    }
  }

  return {
    niche: workspace?.niche ?? null,
    followers: latestSnap?.followers ?? null,
    postedYesterday: yesterdayPosts > 0,
    postsLast7Days: last7Media.length,
    avgEngagement,
    bestFormat,
    streakDays: 0,
  };
}
