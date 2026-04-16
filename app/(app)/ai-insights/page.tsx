import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InsightsUI, type InsightsPageData } from "./insights-ui";
import { insights as mockInsights, insightSummary as mockSummary } from "@/lib/mock/ai-insights";
import { DemoBanner } from "@/components/ui/demo-banner";
import { getInstagramMetrics } from "@/lib/services/instagram-metrics";
import { generateInsightsFromMetrics } from "@/lib/services/ai-insights";

export default async function AIInsightsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let dbInsights = await prisma.aiInsight.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Auto-generate insights if IG connected but no insights yet
  if (dbInsights.length === 0) {
    const igMetrics = await getInstagramMetrics(user.id);
    if (igMetrics) {
      const result = await generateInsightsFromMetrics(user.id);
      if (result.ok && result.insights.length > 0) {
        await prisma.aiInsight.createMany({
          data: result.insights.map((insight) => ({
            userId: user.id,
            category: insight.category,
            title: insight.title,
            description: insight.description,
            impact: insight.impact,
            metric: insight.metric,
            source: result.source,
          })),
        });
        dbInsights = await prisma.aiInsight.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        });
      }
    }
  }

  let data: InsightsPageData;

  if (dbInsights.length > 0) {
    const source = dbInsights[0].source as "local" | "ai";
    const generatedAt = dbInsights[0].createdAt.toISOString();

    data = {
      source,
      generatedAt,
      summary: null,
      insights: dbInsights.map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        category: i.category as "strategy" | "timing" | "audience" | "growth",
        impact: i.impact as "high" | "medium" | "low",
        metric: i.metric,
      })),
    };
  } else {
    data = {
      source: "demo",
      generatedAt: null,
      summary: mockSummary,
      insights: mockInsights.map((i) => ({
        id: String(i.id),
        title: i.title,
        description: i.description,
        category: i.category,
        impact: i.impact,
        metric: i.metric ?? null,
      })),
    };
  }

  return (
    <>
      {dbInsights.length === 0 && (
        <DemoBanner feature="Les insights IA (exemples — connecte Instagram pour des analyses personnalisées)" />
      )}
      <InsightsUI data={data} />
    </>
  );
}
