"use client";

import { SectionHeader, Card, CardHeader, CardTitle, Badge } from "@/components/ui";
import { Lightbulb, TrendingUp, Clock, Users, Sprout } from "lucide-react";
import { insights, insightSummary, type InsightCategory } from "@/lib/mock/ai-insights";
import type { LucideIcon } from "lucide-react";

const categoryConfig: Record<InsightCategory, { label: string; icon: LucideIcon }> = {
  strategy: { label: "Stratégie de contenu", icon: Lightbulb },
  timing: { label: "Timing", icon: Clock },
  audience: { label: "Audience", icon: Users },
  growth: { label: "Growth", icon: Sprout },
};

const categories: InsightCategory[] = ["strategy", "timing", "audience", "growth"];

export function InsightsUI() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="AI Insights"
        description="Recommandations personnalisées basées sur vos données de performance"
      />

      <Card>
        <CardHeader>
          <CardTitle>Résumé</CardTitle>
        </CardHeader>
        <p className="text-sm leading-relaxed text-text-secondary">{insightSummary}</p>
      </Card>

      {categories.map((cat) => {
        const config = categoryConfig[cat];
        const catInsights = insights.filter((i) => i.category === cat);
        if (catInsights.length === 0) return null;
        return (
          <div key={cat}>
            <div className="mb-4 flex items-center gap-2">
              <config.icon className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">{config.label}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {catInsights.map((insight) => (
                <Card key={insight.id} className="flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground pr-2">{insight.title}</h3>
                    <Badge
                      variant={
                        insight.impact === "high" ? "danger" : insight.impact === "medium" ? "warning" : "info"
                      }
                    >
                      {insight.impact}
                    </Badge>
                  </div>
                  <p className="text-xs leading-relaxed text-text-secondary flex-1">{insight.description}</p>
                  {insight.metric && (
                    <div className="mt-3 flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-accent" />
                      <span className="text-xs font-medium text-accent">{insight.metric}</span>
                    </div>
                  )}
                  {insight.sparkline && (
                    <div className="mt-3 flex items-end gap-0.5 h-8">
                      {insight.sparkline.map((v, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm bg-accent"
                          style={{
                            height: `${(v / Math.max(...insight.sparkline!)) * 100}%`,
                            opacity: 0.4 + (i / insight.sparkline!.length) * 0.6,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
