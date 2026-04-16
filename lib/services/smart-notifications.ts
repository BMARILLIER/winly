import { prisma } from "@/lib/db";
import { getActiveConnection } from "@/lib/services/instagram-connection";
import { getProgressStats } from "@/lib/queries/progress-stats";
import { sendEmail } from "@/lib/services/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface NotificationContext {
  userId: string;
  email: string;
  name: string | null;
}

export interface NotificationResult {
  sent: number;
  skipped: number;
}

export async function sendSmartNotifications(): Promise<NotificationResult> {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
  });

  let sent = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      const didSend = await processUserNotifications({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
      if (didSend) sent++;
      else skipped++;
    } catch (err) {
      console.error("[smart-notif] failed for", user.id, err);
      skipped++;
    }
  }

  return { sent, skipped };
}

async function processUserNotifications(ctx: NotificationContext): Promise<boolean> {
  const connection = await getActiveConnection(ctx.userId);
  if (!connection) return false;

  const workspace = await prisma.workspace.findFirst({
    where: { userId: ctx.userId },
    select: { id: true },
  });
  if (!workspace) return false;

  const displayName = ctx.name?.trim() || "createur";

  // Check multiple triggers in parallel
  const [streakData, newComments, topPostAlert] = await Promise.all([
    checkStreakDanger(ctx.userId),
    checkNewComments(connection.id),
    checkTopPostPerformance(connection.id),
  ]);

  const alerts: { subject: string; body: string }[] = [];

  // 1. Streak danger
  if (streakData.inDanger && streakData.streakDays > 0) {
    alerts.push({
      subject: `🔥 Ta streak de ${streakData.streakDays}j est en danger !`,
      body: `Salut ${displayName},\n\nTu n'as pas complete ta mission aujourd'hui — ta streak de ${streakData.streakDays} jours va se casser si tu n'agis pas avant minuit.\n\nOuvre Winly et complete ta mission du jour :\n${APP_URL}/missions\n\n— Winly`,
    });
  }

  // 2. New comments to reply
  if (newComments.count > 0) {
    alerts.push({
      subject: `💬 ${newComments.count} commentaire${newComments.count > 1 ? "s" : ""} en attente`,
      body: `Salut ${displayName},\n\nTu as ${newComments.count} nouveau${newComments.count > 1 ? "x" : ""} commentaire${newComments.count > 1 ? "s" : ""} sur tes posts recents. L'IA peut te suggerer des reponses en 1 clic :\n${APP_URL}/comments\n\n— Winly`,
    });
  }

  // 3. Top post alert
  if (topPostAlert.isViral) {
    alerts.push({
      subject: `🚀 Ton post explose ! ${topPostAlert.likes} likes`,
      body: `Salut ${displayName},\n\nTon dernier post a atteint ${topPostAlert.likes} likes — c'est ${topPostAlert.aboveAvgPct}% au-dessus de ta moyenne ! Continue sur cette lancee.\n\nVoir tes analytics :\n${APP_URL}/analytics\n\n— Winly`,
    });
  }

  // Send max 1 notification per run (most important first)
  if (alerts.length === 0) return false;

  const alert = alerts[0];
  const result = await sendEmail({
    to: ctx.email,
    subject: alert.subject,
    text: alert.body,
  });

  return result.sent;
}

async function checkStreakDanger(userId: string): Promise<{ inDanger: boolean; streakDays: number }> {
  const stats = await getProgressStats(userId);
  if (!stats) return { inDanger: false, streakDays: 0 };
  return {
    inDanger: !stats.completedToday && stats.streakDays > 0,
    streakDays: stats.streakDays,
  };
}

async function checkNewComments(connectionId: string): Promise<{ count: number }> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentMedia = await prisma.instagramMedia.findMany({
    where: {
      connectionId,
      timestamp: { gte: oneDayAgo },
      commentsCount: { gt: 0 },
    },
    select: { commentsCount: true },
  });
  const total = recentMedia.reduce((s, m) => s + m.commentsCount, 0);
  return { count: total };
}

async function checkTopPostPerformance(
  connectionId: string,
): Promise<{ isViral: boolean; likes: number; aboveAvgPct: number }> {
  const media = await prisma.instagramMedia.findMany({
    where: { connectionId },
    orderBy: { timestamp: "desc" },
    take: 20,
    select: { likeCount: true, timestamp: true },
  });

  if (media.length < 5) return { isViral: false, likes: 0, aboveAvgPct: 0 };

  const latest = media[0];
  const olderMedia = media.slice(1);
  const avgLikes = olderMedia.reduce((s, m) => s + m.likeCount, 0) / olderMedia.length;

  if (avgLikes === 0) return { isViral: false, likes: 0, aboveAvgPct: 0 };

  const aboveAvgPct = Math.round(((latest.likeCount - avgLikes) / avgLikes) * 100);

  // Consider viral if 40%+ above average
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const isRecent = latest.timestamp >= oneDayAgo;

  return {
    isViral: isRecent && aboveAvgPct >= 40,
    likes: latest.likeCount,
    aboveAvgPct,
  };
}
