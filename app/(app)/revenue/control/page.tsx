import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getInstagramMetrics } from "@/lib/services/instagram-metrics";
import { computeRevenue, estimateRevenue } from "@/modules/revenue";
import { generateActionPlan } from "@/modules/action-plan";
import { buildRevenueControl } from "@/modules/revenue-control";
import { RevenueControlUI } from "./revenue-control-ui";

export default async function RevenueControlPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  // Revenue engine
  const igMetrics = await getInstagramMetrics(user.id);
  const revenueReport = igMetrics
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

  // Score + action plan
  const latestScore = await prisma.scoreResult.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { details: true },
  });

  let actionPlan = null;
  if (latestScore?.details) {
    try {
      const parsed = JSON.parse(latestScore.details);
      if (parsed.pillars) {
        actionPlan = generateActionPlan(parsed.pillars);
      }
    } catch {}
  }

  // Build control center data
  const controlData = buildRevenueControl(revenueReport, actionPlan);

  return (
    <RevenueControlUI
      data={controlData}
      monthlyMin={revenueReport.monthlyEarningsMin}
      monthlyMax={revenueReport.monthlyEarningsMax}
    />
  );
}
