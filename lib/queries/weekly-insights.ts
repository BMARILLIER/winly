import { prisma } from "@/lib/db";

export interface WeeklyPostStat {
  igMediaId: string;
  mediaType: string;
  caption: string | null;
  permalink: string | null;
  likeCount: number;
  commentsCount: number;
  saved: number | null;
  reach: number | null;
  timestamp: string;
  engagement: number; // likes + comments
}

export interface WeeklyInsights {
  hasInstagram: boolean;
  hasPosts: boolean;
  followers: number | null;
  followersPrevWeek: number | null;
  followersDelta: number | null;
  topPost: WeeklyPostStat | null;
  flopPost: WeeklyPostStat | null;
  thisWeekPosts: number;
  thisWeekAvgEngagement: number;
  prevWeekAvgEngagement: number;
  engagementDeltaPct: number | null; // % vs semaine précédente
  bestFormat: string | null; // type de média avec le meilleur engagement moyen
  niche: string | null;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getWeeklyInsights(userId: string): Promise<WeeklyInsights> {
  const now = Date.now();
  const sinceThisWeek = new Date(now - WEEK_MS);
  const sincePrevWeek = new Date(now - 2 * WEEK_MS);

  const workspace = await prisma.workspace.findFirst({
    where: { userId },
    select: { niche: true },
  });

  const connection = await prisma.instagramConnection.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!connection) {
    return {
      hasInstagram: false,
      hasPosts: false,
      followers: null,
      followersPrevWeek: null,
      followersDelta: null,
      topPost: null,
      flopPost: null,
      thisWeekPosts: 0,
      thisWeekAvgEngagement: 0,
      prevWeekAvgEngagement: 0,
      engagementDeltaPct: null,
      bestFormat: null,
      niche: workspace?.niche ?? null,
    };
  }

  const [snapshots, thisWeekMedia, prevWeekMedia, last30Media] = await Promise.all([
    prisma.instagramSnapshot.findMany({
      where: { connectionId: connection.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.instagramMedia.findMany({
      where: { connectionId: connection.id, timestamp: { gte: sinceThisWeek } },
      orderBy: { timestamp: "desc" },
    }),
    prisma.instagramMedia.findMany({
      where: {
        connectionId: connection.id,
        timestamp: { gte: sincePrevWeek, lt: sinceThisWeek },
      },
    }),
    prisma.instagramMedia.findMany({
      where: { connectionId: connection.id },
      orderBy: { timestamp: "desc" },
      take: 30,
    }),
  ]);

  const latestSnap = snapshots[0];
  const weekAgoSnap = snapshots.find((s) => s.createdAt <= sinceThisWeek);
  const followers = latestSnap?.followers ?? null;
  const followersPrevWeek = weekAgoSnap?.followers ?? null;
  const followersDelta =
    followers != null && followersPrevWeek != null
      ? followers - followersPrevWeek
      : null;

  function mapPost(m: (typeof last30Media)[number]): WeeklyPostStat {
    return {
      igMediaId: m.igMediaId,
      mediaType: m.mediaType,
      caption: m.caption,
      permalink: m.permalink,
      likeCount: m.likeCount,
      commentsCount: m.commentsCount,
      saved: m.saved,
      reach: m.reach,
      timestamp: m.timestamp.toISOString(),
      engagement: m.likeCount + m.commentsCount,
    };
  }

  const analysisPool = thisWeekMedia.length > 0 ? thisWeekMedia : last30Media;
  const ranked = analysisPool.map(mapPost).sort((a, b) => b.engagement - a.engagement);
  const topPost = ranked[0] ?? null;
  const flopPost = ranked.length > 1 ? ranked[ranked.length - 1] : null;

  const thisWeekAvgEngagement =
    thisWeekMedia.length > 0
      ? Math.round(
          thisWeekMedia.reduce((s, m) => s + m.likeCount + m.commentsCount, 0) /
            thisWeekMedia.length,
        )
      : 0;
  const prevWeekAvgEngagement =
    prevWeekMedia.length > 0
      ? Math.round(
          prevWeekMedia.reduce((s, m) => s + m.likeCount + m.commentsCount, 0) /
            prevWeekMedia.length,
        )
      : 0;
  const engagementDeltaPct =
    prevWeekAvgEngagement > 0
      ? Math.round(
          ((thisWeekAvgEngagement - prevWeekAvgEngagement) / prevWeekAvgEngagement) * 100,
        )
      : null;

  // Meilleur format sur les 30 derniers posts
  const byType = new Map<string, { count: number; engagement: number }>();
  for (const m of last30Media) {
    const cur = byType.get(m.mediaType) ?? { count: 0, engagement: 0 };
    cur.count += 1;
    cur.engagement += m.likeCount + m.commentsCount;
    byType.set(m.mediaType, cur);
  }
  let bestFormat: string | null = null;
  let bestAvg = 0;
  for (const [type, stats] of byType.entries()) {
    const avg = stats.engagement / stats.count;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestFormat = type;
    }
  }

  return {
    hasInstagram: true,
    hasPosts: last30Media.length > 0,
    followers,
    followersPrevWeek,
    followersDelta,
    topPost,
    flopPost,
    thisWeekPosts: thisWeekMedia.length,
    thisWeekAvgEngagement,
    prevWeekAvgEngagement,
    engagementDeltaPct,
    bestFormat,
    niche: workspace?.niche ?? null,
  };
}
