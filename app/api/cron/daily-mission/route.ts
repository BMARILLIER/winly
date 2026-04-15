import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendDailyCoachEmail } from "@/lib/services/email";
import { getDailyContext } from "@/lib/queries/daily-context";
import { generateDailyMission } from "@/lib/services/daily-mission-ai";

const MIN_INTERVAL_MS = 20 * 60 * 60 * 1000; // 20h anti double-envoi

/**
 * Daily coach mission cron.
 * Trigger via Vercel Cron (every day at 7h UTC = 8h Paris hiver / 9h été).
 * Sends one AI mission per opted-in user.
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
      dailyCoachEnabled: true,
      OR: [{ lastDailyCoachAt: null }, { lastDailyCoachAt: { lt: cutoff } }],
    },
    select: { id: true, email: true, name: true },
  });

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const workspaces = await prisma.workspace.findMany({
        where: { userId: user.id },
        select: { id: true },
      });
      if (workspaces.length === 0) continue;

      const ctx = await getDailyContext(user.id);
      const mission = await generateDailyMission(ctx);

      const result = await sendDailyCoachEmail(user.email, user.name, mission);

      if (result.sent) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastDailyCoachAt: new Date() },
        });
        sent += 1;
      } else {
        failed += 1;
      }
    } catch (err) {
      console.error("[cron] daily-mission failed for", user.id, err);
      failed += 1;
    }
  }

  return NextResponse.json({ ok: true, total: users.length, sent, failed });
}

export const GET = handle;
export const POST = handle;
