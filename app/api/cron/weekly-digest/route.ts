import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWeeklyDigestEmail } from "@/lib/services/email";
import { getProgressStats } from "@/lib/queries/progress-stats";

const MIN_INTERVAL_MS = 6 * 24 * 60 * 60 * 1000; // 6 jours (évite double envoi)

/**
 * Weekly digest email cron.
 * Trigger via Vercel Cron (ex: every Sunday at 18:00 UTC).
 * Sends one email per user with progress + content stats.
 * Protected by CRON_SECRET header.
 */
async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const cutoff = new Date(Date.now() - MIN_INTERVAL_MS);
  const users = await prisma.user.findMany({
    where: {
      OR: [{ lastDigestSentAt: null }, { lastDigestSentAt: { lt: cutoff } }],
    },
    select: { id: true, email: true, name: true },
  });

  let sent = 0;
  let failed = 0;
  const sinceWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  for (const user of users) {
    try {
      const [stats, workspaces, contentCreated] = await Promise.all([
        getProgressStats(user.id),
        prisma.workspace.findMany({
          where: { userId: user.id },
          select: { id: true },
        }),
        prisma.contentIdea.count({
          where: {
            workspace: { userId: user.id },
            createdAt: { gte: sinceWeekAgo },
          },
        }),
      ]);

      // Skip users sans workspace (pas encore onboardés)
      if (workspaces.length === 0) continue;

      // Suivi followers via snapshots IG si dispo
      const connection = await prisma.instagramConnection.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      let newFollowers: number | null = null;
      if (connection) {
        const snapshots = await prisma.instagramSnapshot.findMany({
          where: { connectionId: connection.id },
          orderBy: { createdAt: "desc" },
          take: 10,
        });
        const latest = snapshots[0];
        const weekAgo = snapshots.find((s) => s.createdAt <= sinceWeekAgo);
        if (latest?.followers != null && weekAgo?.followers != null) {
          newFollowers = latest.followers - weekAgo.followers;
        } else if (latest?.followers != null) {
          newFollowers = 0;
        }
      }

      const result = await sendWeeklyDigestEmail(user.email, user.name, {
        totalXp: stats?.totalXp ?? 0,
        level: stats?.level ?? 1,
        streakDays: stats?.streakDays ?? 0,
        newFollowers,
        contentCreated,
        alertsCount: 0,
      });

      if (result.sent) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastDigestSentAt: new Date() },
        });
        sent += 1;
      } else {
        failed += 1;
      }
    } catch (err) {
      console.error("[cron] digest failed for", user.id, err);
      failed += 1;
    }
  }

  return NextResponse.json({ ok: true, total: users.length, sent, failed });
}

export const GET = handle;
export const POST = handle;
