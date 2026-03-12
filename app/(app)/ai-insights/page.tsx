import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InsightsUI, type InsightsPageData } from "./insights-ui";
import { insights as mockInsights, insightSummary as mockSummary } from "@/lib/mock/ai-insights";

export default async function AIInsightsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dbInsights = await prisma.aiInsight.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  let data: InsightsPageData;

  if (dbInsights.length > 0) {
    const source = dbInsights[0].source as "local" | "ai";
    const generatedAt = dbInsights[0].createdAt.toISOString();

    data = {
      source,
      generatedAt,
      summary: null, // summary is in the insights themselves (first generation)
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

  return <InsightsUI data={data} />;
}
