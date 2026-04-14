import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getInstagramMetrics } from "@/lib/services/instagram-metrics";
import { computeRevenue, estimateRevenue } from "@/modules/revenue";
import { RevenuePageUI } from "./revenue-page-ui";

export default async function RevenuePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const igMetrics = await getInstagramMetrics(user.id);

  const report = igMetrics
    ? computeRevenue({
        followers: igMetrics.followers,
        engagementRate: igMetrics.engagementRate,
        avgLikes: igMetrics.avgLikes,
        avgComments: igMetrics.avgComments,
        mediaCount: igMetrics.mediaCount,
        niche: workspace.niche,
        monthlyGrowth: igMetrics.monthlyGrowth,
      })
    : estimateRevenue(workspace.niche);

  return (
    <RevenuePageUI
      report={report}
      hasInstagram={!!igMetrics}
      niche={workspace.niche}
      followers={igMetrics?.followers ?? null}
      engagementRate={igMetrics?.engagementRate ?? null}
    />
  );
}
