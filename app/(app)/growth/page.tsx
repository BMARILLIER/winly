import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getInstagramMetrics, buildGrowthEngineInput, formatWithSign, formatCompact } from "@/lib/services/instagram-metrics";
import { computeGrowthEngine } from "@/modules/growth-engine";
import { GrowthUI, type GrowthData } from "./growth-ui";
import {
  followerGrowth as mockFollowerGrowth,
  growthRates as mockGrowthRates,
} from "@/lib/mock/growth";
import { mockGrowthReport } from "@/lib/mock/growth-engine";
import { DemoBanner } from "@/components/ui/demo-banner";

export default async function GrowthPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const igMetrics = await getInstagramMetrics(user.id);

  let data: GrowthData;

  if (igMetrics && igMetrics.followerHistory.length > 0) {
    const engineInput = buildGrowthEngineInput(igMetrics, workspace.postFrequency);
    const growthReport = computeGrowthEngine(engineInput);

    // Compute trend percentages from growth ratios
    const dailyTrend = igMetrics.followers > 0
      ? Math.round((igMetrics.dailyGrowth / igMetrics.followers) * 1000) / 10
      : 0;
    const weeklyTrend = igMetrics.followers > 0
      ? Math.round((igMetrics.weeklyGrowth / igMetrics.followers) * 1000) / 10
      : 0;
    const monthlyTrend = igMetrics.followers > 0
      ? Math.round((igMetrics.monthlyGrowth / igMetrics.followers) * 1000) / 10
      : 0;

    // 3-month projection based on monthly growth
    const projected = igMetrics.followers + igMetrics.monthlyGrowth * 3;

    data = {
      source: "instagram",
      igUsername: igMetrics.igUsername,
      lastSyncAt: igMetrics.lastSyncAt,
      followerGrowth: igMetrics.followerHistory,
      growthRates: {
        daily: { value: formatWithSign(igMetrics.dailyGrowth), trend: dailyTrend },
        weekly: { value: formatWithSign(igMetrics.weeklyGrowth), trend: weeklyTrend },
        monthly: { value: formatWithSign(igMetrics.monthlyGrowth), trend: monthlyTrend },
        projected: { value: formatCompact(projected), trend: monthlyTrend * 3 },
      },
      growthReport,
    };
  } else {
    data = {
      source: "demo",
      followerGrowth: mockFollowerGrowth,
      growthRates: mockGrowthRates,
      growthReport: mockGrowthReport,
    };
  }

  const showDemoBanner = !igMetrics || igMetrics.followerHistory.length === 0;

  return (
    <>
      {showDemoBanner && <DemoBanner feature="La courbe de croissance (sans Instagram connecté)" />}
      <GrowthUI data={data} />
    </>
  );
}
