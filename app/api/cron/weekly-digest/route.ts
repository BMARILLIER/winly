import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWeeklyDigestEmail } from "@/lib/services/email";
import { getProgressStats } from "@/lib/queries/progress-stats";
import { getWeeklyInsights } from "@/lib/queries/weekly-insights";
import { generateWeeklyReport } from "@/lib/services/weekly-report-ai";

const MIN_INTERVAL_MS = 6 * 24 * 60 * 60 * 1000; // 6 jours (évite double envoi)

/**
 * Weekly digest email cron.
 * Trigger via Vercel Cron (ex: every Sunday at 18:00 UTC).
 * Sends one AI-enriched report per user.
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
      const [stats, workspaces, contentCreated, insights] = await Promise.all([
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
        getWeeklyInsights(user.id),
      ]);

      // Skip users sans workspace (pas encore onboardés)
      if (workspaces.length === 0) continue;

      const report = await generateWeeklyReport(insights);

      const result = await sendWeeklyDigestEmail(user.email, user.name, {
        totalXp: stats?.totalXp ?? 0,
        level: stats?.level ?? 1,
        streakDays: stats?.streakDays ?? 0,
        newFollowers: insights.followersDelta,
        contentCreated,
        alertsCount: 0,
        intro: report.intro,
        topPost: insights.topPost
          ? {
              type: insights.topPost.mediaType,
              likes: insights.topPost.likeCount,
              comments: insights.topPost.commentsCount,
              caption: insights.topPost.caption,
              permalink: insights.topPost.permalink,
              reason: report.topPostReason,
            }
          : null,
        flopPost: insights.flopPost
          ? {
              type: insights.flopPost.mediaType,
              likes: insights.flopPost.likeCount,
              comments: insights.flopPost.commentsCount,
              caption: insights.flopPost.caption,
              reason: report.flopPostReason,
            }
          : null,
        engagementDeltaPct: insights.engagementDeltaPct,
        actions: report.actions,
        opportunity: report.opportunity,
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
