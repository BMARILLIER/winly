import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  decryptToken,
  encryptToken,
  refreshLongLivedToken,
} from "@/lib/services/instagram";

/**
 * Proactively refresh all Instagram tokens expiring within 10 days.
 * Call from a Vercel cron: add to vercel.json or use the dashboard.
 * Protected by CRON_SECRET header for unattended execution.
 */
async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const tenDaysFromNow = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  const connections = await prisma.instagramConnection.findMany({
    where: { tokenExpiresAt: { lte: tenDaysFromNow } },
    select: { id: true, accessToken: true, tokenExpiresAt: true },
  });

  let refreshed = 0;
  let failed = 0;

  for (const conn of connections) {
    try {
      const token = decryptToken(conn.accessToken);
      const res = await refreshLongLivedToken(token);
      const newExpiresAt = new Date(Date.now() + res.expires_in * 1000);
      await prisma.instagramConnection.update({
        where: { id: conn.id },
        data: {
          accessToken: encryptToken(res.access_token),
          tokenExpiresAt: newExpiresAt,
        },
      });
      refreshed += 1;
    } catch (err) {
      console.error("[cron] token refresh failed for", conn.id, err);
      failed += 1;
    }
  }

  return NextResponse.json({ ok: true, total: connections.length, refreshed, failed });
}

export const GET = handle;
export const POST = handle;
