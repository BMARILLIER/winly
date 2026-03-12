"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { generateInsightsFromMetrics } from "@/lib/services/ai-insights";
import { revalidatePath } from "next/cache";

export interface GenerateInsightsResult {
  ok: boolean;
  count?: number;
  source?: "local" | "ai";
  error?: string;
}

export async function generateInsights(): Promise<GenerateInsightsResult> {
  const user = await requireAuth();

  const result = await generateInsightsFromMetrics(user.id);

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  // Delete previous insights for this user (replace, not accumulate)
  await prisma.aiInsight.deleteMany({ where: { userId: user.id } });

  // Persist new insights
  if (result.insights.length > 0) {
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
  }

  revalidatePath("/ai-insights");

  return {
    ok: true,
    count: result.insights.length,
    source: result.source,
  };
}

export interface InsightData {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: string;
  metric: string | null;
  source: string;
  createdAt: string;
}

export async function getInsights(): Promise<InsightData[]> {
  const user = await requireAuth();

  const insights = await prisma.aiInsight.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return insights.map((i) => ({
    id: i.id,
    category: i.category,
    title: i.title,
    description: i.description,
    impact: i.impact,
    metric: i.metric,
    source: i.source,
    createdAt: i.createdAt.toISOString(),
  }));
}
