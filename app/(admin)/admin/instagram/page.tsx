import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InstagramDebugPanel } from "./debug-panel";

export default async function AdminInstagramPage() {
  const user = await requireAdmin();

  // Fetch all Instagram debug data server-side
  const connection = await prisma.instagramConnection.findFirst({
    select: {
      id: true,
      userId: true,
      igUserId: true,
      igUsername: true,
      connectedAt: true,
      lastSyncAt: true,
      tokenExpiresAt: true,
    },
  });

  let snapshot = null;
  let recentMedia: {
    id: string;
    mediaType: string;
    caption: string | null;
    likeCount: number;
    commentsCount: number;
    reach: number | null;
    timestamp: Date;
  }[] = [];
  let mediaTotal = 0;

  if (connection) {
    snapshot = await prisma.instagramSnapshot.findFirst({
      where: { connectionId: connection.id },
      orderBy: { createdAt: "desc" },
    });

    recentMedia = await prisma.instagramMedia.findMany({
      where: { connectionId: connection.id },
      orderBy: { timestamp: "desc" },
      take: 10,
      select: {
        id: true,
        mediaType: true,
        caption: true,
        likeCount: true,
        commentsCount: true,
        reach: true,
        timestamp: true,
      },
    });

    mediaTotal = await prisma.instagramMedia.count({
      where: { connectionId: connection.id },
    });
  }

  const aiInsights = await prisma.aiInsight.findMany({
    where: { userId: connection?.userId ?? user.id },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates for client component
  const data = {
    connection: connection
      ? {
          igUserId: connection.igUserId,
          igUsername: connection.igUsername,
          connectedAt: connection.connectedAt.toISOString(),
          lastSyncAt: connection.lastSyncAt?.toISOString() ?? null,
          tokenExpiresAt: connection.tokenExpiresAt?.toISOString() ?? null,
        }
      : null,
    snapshot: snapshot
      ? {
          followers: snapshot.followers,
          follows: snapshot.follows,
          mediaCount: snapshot.mediaCount,
          reach: snapshot.reach,
          impressions: snapshot.impressions,
          profileViews: snapshot.profileViews,
          createdAt: snapshot.createdAt.toISOString(),
        }
      : null,
    recentMedia: recentMedia.map((m) => ({
      id: m.id,
      mediaType: m.mediaType,
      caption: m.caption,
      likeCount: m.likeCount,
      commentsCount: m.commentsCount,
      reach: m.reach,
      timestamp: m.timestamp.toISOString(),
    })),
    mediaTotal,
    aiInsights: aiInsights.map((i) => ({
      id: i.id,
      category: i.category,
      title: i.title,
      description: i.description,
      impact: i.impact,
      metric: i.metric,
      source: i.source,
    })),
  };

  return <InstagramDebugPanel data={data} />;
}
