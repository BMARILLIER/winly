import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getInstagramMetrics, formatCompact } from "@/lib/services/instagram-metrics";
import { AnalyticsUI, type AnalyticsData } from "./analytics-ui";
import {
  engagementTimeSeries as mockEngagementTimeSeries,
  contentPerformance as mockContentPerformance,
  analyticsKPIs as mockAnalyticsKPIs,
} from "@/lib/mock/analytics";
import { DemoBanner } from "@/components/ui/demo-banner";

const TYPE_LABELS: Record<string, string> = {
  IMAGE: "Images",
  VIDEO: "Reels",
  CAROUSEL_ALBUM: "Carousels",
};

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const igMetrics = await getInstagramMetrics(user.id);

  let data: AnalyticsData;

  if (igMetrics) {
    const engRate = Math.round(igMetrics.engagementRate * 1000) / 10; // e.g. 4.2%
    const totalImpressions =
      igMetrics.accountImpressions ??
      igMetrics.recentMedia.reduce((s, m) => s + (m.impressions ?? 0), 0);

    data = {
      source: "instagram",
      igUsername: igMetrics.igUsername,
      lastSyncAt: igMetrics.lastSyncAt,
      engagementTimeSeries: mockEngagementTimeSeries, // keep mock (daily time series not available from IG basic API)
      contentPerformance: igMetrics.mediaByType.map((m) => ({
        type: TYPE_LABELS[m.type] ?? m.type,
        engagement: igMetrics.followers > 0
          ? Math.round(((m.avgLikes + m.avgComments) / igMetrics.followers) * 1000) / 10
          : 0,
        reach: m.avgReach * m.count,
        posts: m.count,
      })),
      analyticsKPIs: {
        followers: { value: formatCompact(igMetrics.followers), trend: igMetrics.followers > 0 ? Math.round((igMetrics.monthlyGrowth / igMetrics.followers) * 1000) / 10 : 0 },
        engagementRate: { value: `${engRate}%`, trend: 0 },
        impressions: { value: formatCompact(totalImpressions), trend: 0 },
        avgLikes: { value: formatCompact(igMetrics.avgLikes), trend: 0 },
      },
    };
  } else {
    data = {
      source: "demo",
      engagementTimeSeries: mockEngagementTimeSeries,
      contentPerformance: mockContentPerformance,
      analyticsKPIs: mockAnalyticsKPIs,
    };
  }

  return (
    <>
      {!igMetrics && <DemoBanner feature="Les analytics (sans Instagram connecté)" />}
      <AnalyticsUI data={data} />
    </>
  );
}
