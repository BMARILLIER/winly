import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getInstagramMetrics } from "@/lib/services/instagram-metrics";
import { computeRevenue, estimateRevenue } from "@/modules/revenue";
import { generateActionPlan } from "@/modules/action-plan";
import { buildRevenueControl } from "@/modules/revenue-control";
import { getTopPerformers, type ChatterInput } from "@/modules/star-engine";
import { CeoDashboardUI } from "./ceo-dashboard-ui";

export default async function CeoDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  // --- Revenue Engine ---
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

  // --- Score + Action Plan ---
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

  // --- Revenue Control ---
  const controlData = buildRevenueControl(revenueReport, actionPlan);

  // --- Star Engine (mock data for now) ---
  const mockChatters: ChatterInput[] = [
    { id: "c1", name: "Sarah M.", revenue: 4200, conversion: 0.32, messagesSent: 580 },
    { id: "c2", name: "Lucas D.", revenue: 3800, conversion: 0.28, messagesSent: 720 },
    { id: "c3", name: "Emma R.", revenue: 5100, conversion: 0.41, messagesSent: 490 },
    { id: "c4", name: "Hugo T.", revenue: 1900, conversion: 0.15, messagesSent: 890 },
    { id: "c5", name: "Clara B.", revenue: 2700, conversion: 0.22, messagesSent: 610 },
  ];
  const topChatters = getTopPerformers(mockChatters, 3);

  return (
    <CeoDashboardUI
      controlData={controlData}
      monthlyMin={revenueReport.monthlyEarningsMin}
      monthlyMax={revenueReport.monthlyEarningsMax}
      topChatters={topChatters}
    />
  );
}
