import Link from "next/link";
import { Bell } from "lucide-react";
import { prisma } from "@/lib/db";
import { getInstagramMetrics } from "@/lib/services/instagram-metrics";
import { detectAlerts } from "@/modules/alerts";

/**
 * Bell in the header.
 * Counts actionable items: alerts (danger/warning) + unseen AI insights.
 * Links to /ai-insights where user can consult them.
 */
export async function NotificationBell({ userId }: { userId: string }) {
  const [igMetrics, insightsCount] = await Promise.all([
    getInstagramMetrics(userId),
    prisma.aiInsight.count({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  let alertsCount = 0;
  if (igMetrics) {
    const alerts = detectAlerts({
      followers: igMetrics.followers,
      engagementRate: igMetrics.engagementRate,
      previousEngagementRate: null,
      weeklyGrowth: igMetrics.weeklyGrowth,
      monthlyGrowth: igMetrics.monthlyGrowth,
      postsLast30d: igMetrics.recentMedia.length,
      avgLikes: igMetrics.avgLikes,
      avgComments: igMetrics.avgComments,
      accountReach: igMetrics.accountReach,
      hasInstagram: true,
    });
    alertsCount = alerts.filter(
      (a) => a.type === "danger" || a.type === "warning",
    ).length;
  }

  const total = alertsCount + insightsCount;
  const hasUnread = total > 0;

  return (
    <Link
      href="/ai-insights"
      className="relative rounded-lg p-2 text-text-secondary hover:bg-surface-2 hover:text-foreground transition-colors"
      aria-label={hasUnread ? `${total} notifications` : "Notifications"}
    >
      <Bell className="h-4 w-4" />
      {hasUnread && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
          {total > 9 ? "9+" : total}
        </span>
      )}
    </Link>
  );
}
