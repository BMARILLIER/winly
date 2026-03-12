/**
 * Instagram Metrics Service — server-only.
 *
 * Central normalization layer: reads Instagram data from DB
 * and returns structured metrics for all consuming modules
 * (Creator Score, Growth, Analytics).
 *
 * Returns null when Instagram is not connected or no data exists.
 */

import { prisma } from "@/lib/db";
import type { GrowthEngineInput } from "@/modules/growth-engine";

// ─── Types ───

export interface InstagramMetrics {
  // Profile
  followers: number;
  follows: number;
  mediaCount: number;
  igUsername: string;
  lastSyncAt: string | null;

  // Engagement (computed from media)
  engagementRate: number; // 0-1 ratio
  avgLikes: number;
  avgComments: number;
  totalSaved: number;

  // Growth (from snapshots)
  followerHistory: { date: string; followers: number }[];
  dailyGrowth: number;
  weeklyGrowth: number;
  monthlyGrowth: number;

  // Reach & impressions (account-level)
  accountReach: number | null;
  accountImpressions: number | null;
  profileViews: number | null;

  // Content breakdown
  mediaByType: {
    type: string;
    count: number;
    avgLikes: number;
    avgComments: number;
    avgReach: number;
  }[];

  // Raw recent media (for detailed views)
  recentMedia: {
    igMediaId: string;
    mediaType: string;
    caption: string | null;
    timestamp: string;
    likeCount: number;
    commentsCount: number;
    reach: number | null;
    impressions: number | null;
    saved: number | null;
  }[];
}

// ─── Main fetch ───

export async function getInstagramMetrics(
  userId: string
): Promise<InstagramMetrics | null> {
  const connection = await prisma.instagramConnection.findUnique({
    where: { userId },
    include: {
      snapshots: { orderBy: { createdAt: "desc" }, take: 90 },
      media: { orderBy: { timestamp: "desc" }, take: 25 },
    },
  });

  if (!connection || connection.snapshots.length === 0) return null;

  const latestSnapshot = connection.snapshots[0];
  const followers = latestSnapshot.followers ?? 0;
  const follows = latestSnapshot.follows ?? 0;
  const mediaCount = latestSnapshot.mediaCount ?? 0;

  // ── Engagement from media ──
  const media = connection.media;
  const totalLikes = media.reduce((s, m) => s + m.likeCount, 0);
  const totalComments = media.reduce((s, m) => s + m.commentsCount, 0);
  const avgLikes = media.length > 0 ? Math.round(totalLikes / media.length) : 0;
  const avgComments =
    media.length > 0 ? Math.round(totalComments / media.length) : 0;
  const engagementRate =
    followers > 0 && media.length > 0
      ? (totalLikes + totalComments) / media.length / followers
      : 0;
  const totalSaved = media.reduce((s, m) => s + (m.saved ?? 0), 0);

  // ── Follower history (oldest first for charts) ──
  const followerHistory = [...connection.snapshots].reverse().map((s) => ({
    date: s.createdAt.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    }),
    followers: s.followers ?? 0,
  }));

  // ── Growth from snapshots ──
  const snapshots = connection.snapshots; // newest first
  const currentFollowers = snapshots[0]?.followers ?? 0;

  function findSnapshotAgo(minMs: number) {
    return snapshots.find(
      (s, i) => i > 0 && Date.now() - s.createdAt.getTime() >= minMs
    );
  }

  const dayAgo = findSnapshotAgo(86_400_000);
  const weekAgo = findSnapshotAgo(7 * 86_400_000);
  const monthAgo = findSnapshotAgo(30 * 86_400_000);

  const dailyGrowth = dayAgo
    ? currentFollowers - (dayAgo.followers ?? 0)
    : 0;
  const weeklyGrowth = weekAgo
    ? currentFollowers - (weekAgo.followers ?? 0)
    : 0;
  const monthlyGrowth = monthAgo
    ? currentFollowers - (monthAgo.followers ?? 0)
    : 0;

  // ── Media by type ──
  const typeMap = new Map<
    string,
    {
      count: number;
      totalLikes: number;
      totalComments: number;
      totalReach: number;
    }
  >();
  for (const m of media) {
    const entry = typeMap.get(m.mediaType) ?? {
      count: 0,
      totalLikes: 0,
      totalComments: 0,
      totalReach: 0,
    };
    entry.count++;
    entry.totalLikes += m.likeCount;
    entry.totalComments += m.commentsCount;
    entry.totalReach += m.reach ?? 0;
    typeMap.set(m.mediaType, entry);
  }

  const mediaByType = Array.from(typeMap.entries()).map(([type, data]) => ({
    type,
    count: data.count,
    avgLikes: Math.round(data.totalLikes / data.count),
    avgComments: Math.round(data.totalComments / data.count),
    avgReach: Math.round(data.totalReach / data.count),
  }));

  return {
    followers,
    follows,
    mediaCount,
    igUsername: connection.igUsername,
    lastSyncAt: connection.lastSyncAt?.toISOString() ?? null,
    engagementRate,
    avgLikes,
    avgComments,
    totalSaved,
    followerHistory,
    dailyGrowth,
    weeklyGrowth,
    monthlyGrowth,
    accountReach: latestSnapshot.reach,
    accountImpressions: latestSnapshot.impressions,
    profileViews: latestSnapshot.profileViews,
    mediaByType,
    recentMedia: media.map((m) => ({
      igMediaId: m.igMediaId,
      mediaType: m.mediaType,
      caption: m.caption,
      timestamp: m.timestamp.toISOString(),
      likeCount: m.likeCount,
      commentsCount: m.commentsCount,
      reach: m.reach,
      impressions: m.impressions,
      saved: m.saved,
    })),
  };
}

// ─── Growth Engine helpers ───

const FREQ_TO_TARGET: Record<string, number> = {
  daily: 30,
  few_per_week: 12,
  weekly: 4,
  few_per_month: 2,
  irregular: 4,
};

/**
 * Build a GrowthEngineInput from real Instagram metrics.
 * Requires postFrequency from the user's workspace.
 */
export function buildGrowthEngineInput(
  metrics: InstagramMetrics,
  postFrequency: string
): GrowthEngineInput {
  const media = metrics.recentMedia;
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 86_400_000;

  // Posts in last 30 days
  const recentPosts = media.filter(
    (m) => new Date(m.timestamp).getTime() >= thirtyDaysAgo
  );
  const postsLast30d = recentPosts.length;

  // Max gap between posts
  const sortedTimes = recentPosts
    .map((m) => new Date(m.timestamp).getTime())
    .sort((a, b) => a - b);
  let maxGapDays = 0;
  for (let i = 1; i < sortedTimes.length; i++) {
    const gap = (sortedTimes[i] - sortedTimes[i - 1]) / 86_400_000;
    maxGapDays = Math.max(maxGapDays, gap);
  }

  // Reach: current from latest snapshot, previous estimated from older snapshot
  const reachCurrent = metrics.accountReach ?? 0;
  // Use 80% of current as previous estimate if no historical data
  const reachPrevious = Math.round(reachCurrent * 0.8) || 1;

  // Top format usage
  const typeCounts = new Map<string, number>();
  for (const m of media) {
    typeCounts.set(m.mediaType, (typeCounts.get(m.mediaType) ?? 0) + 1);
  }
  const maxTypeCount = Math.max(0, ...typeCounts.values());
  const topFormatUsageShare =
    media.length > 0 ? maxTypeCount / media.length : 0;
  const formatCount = typeCounts.size;

  // Peak hour post ratio (9-12h, 18-21h)
  const peakPosts = recentPosts.filter((m) => {
    const h = new Date(m.timestamp).getHours();
    return (h >= 9 && h <= 12) || (h >= 18 && h <= 21);
  });
  const peakHourPostRatio =
    recentPosts.length > 0 ? peakPosts.length / recentPosts.length : 0;

  // Interaction totals
  const saves = media.reduce((s, m) => s + (m.saved ?? 0), 0);
  const comments = media.reduce((s, m) => s + m.commentsCount, 0);
  const likes = media.reduce((s, m) => s + m.likeCount, 0);

  return {
    engagementRate: metrics.engagementRate,
    benchmarkEngagement: 0.035,
    postsLast30d,
    targetPostsPerMonth: FREQ_TO_TARGET[postFrequency] ?? 4,
    maxGapDays: Math.round(maxGapDays),
    reachCurrent30d: reachCurrent,
    reachPrevious30d: reachPrevious,
    topFormatUsageShare,
    formatCount,
    peakHourPostRatio,
    saves,
    shares: 0, // not available via Instagram Basic API
    comments,
    likes,
  };
}

// ─── Formatting helpers ───

export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatWithSign(n: number): string {
  const formatted = formatCompact(n);
  return n > 0 ? `+${formatted}` : formatted;
}
