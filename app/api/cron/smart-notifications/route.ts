import { NextResponse } from "next/server";
import { sendSmartNotifications } from "@/lib/services/smart-notifications";

/**
 * Smart notifications cron.
 * Runs every 6 hours (4x/day) — checks each user for:
 * - Streak in danger
 * - New comments to reply
 * - Post performing above average
 * Sends max 1 email per user per run.
 * Protected by CRON_SECRET.
 */
async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const result = await sendSmartNotifications();
  return NextResponse.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
