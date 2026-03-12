"use client";

import { useState } from "react";
import { SectionHeader, Card, CardHeader, CardTitle, Badge } from "@/components/ui";
import { Lightbulb, Clock, Users, Sprout, TrendingUp, RefreshCw } from "lucide-react";
import { generateInsights } from "@/lib/actions/ai-insights";
import type { LucideIcon } from "lucide-react";

// ─── Types ───

type InsightCategory = "strategy" | "timing" | "audience" | "growth";

export interface InsightsPageData {
  source: "local" | "ai" | "demo";
  generatedAt: string | null;
  summary: string | null;
  insights: {
    id: string;
    title: string;
    description: string;
    category: InsightCategory;
    impact: "high" | "medium" | "low";
    metric: string | null;
  }[];
}

// ─── Config ───

const categoryConfig: Record<InsightCategory, { label: string; icon: LucideIcon }> = {
  strategy: { label: "Stratégie de contenu", icon: Lightbulb },
  timing: { label: "Timing", icon: Clock },
  audience: { label: "Audience", icon: Users },
  growth: { label: "Growth", icon: Sprout },
};

const categories: InsightCategory[] = ["strategy", "timing", "audience", "growth"];

const impactLabels: Record<string, string> = {
  high: "Impact fort",
  medium: "Impact moyen",
  low: "Impact faible",
};

// ─── Component ───

export function InsightsUI({ data }: { data: InsightsPageData }) {
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setMessage(null);

    const result = await generateInsights();

    setGenerating(false);

    if (result.ok) {
      setMessage({
        type: "success",
        text: `${result.count} insights générés (${result.source === "ai" ? "analyse IA" : "analyse locale"}).`,
      });
    } else {
      setMessage({
        type: "error",
        text: result.error ?? "Erreur lors de la génération.",
      });
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="AI Insights"
        description="Recommandations personnalisées basées sur vos données de performance"
      />

      {/* Source indicator + generate button */}
      <div className="flex flex-wrap items-center gap-3">
        {data.source === "ai" ? (
          <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-xs font-medium text-purple-400">Analyse IA</span>
          </div>
        ) : data.source === "local" ? (
          <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-xs font-medium text-accent">Analyse locale</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-text-muted" />
            <span className="text-xs font-medium text-text-muted">Données de démonstration</span>
          </div>
        )}

        {data.generatedAt && (
          <span className="text-xs text-text-muted">
            Généré le {new Date(data.generatedAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
          {generating ? "Analyse en cours…" : "Analyser mes données"}
        </button>
      </div>

      {/* Feedback message */}
      {message && (
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            message.type === "success"
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Summary */}
      {data.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
          </CardHeader>
          <p className="text-sm leading-relaxed text-text-secondary">{data.summary}</p>
        </Card>
      )}

      {/* Insights by category */}
      {categories.map((cat) => {
        const config = categoryConfig[cat];
        const catInsights = data.insights.filter((i) => i.category === cat);
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
                      {impactLabels[insight.impact] ?? insight.impact}
                    </Badge>
                  </div>
                  <p className="text-xs leading-relaxed text-text-secondary flex-1">{insight.description}</p>
                  {insight.metric && (
                    <div className="mt-3 flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-accent" />
                      <span className="text-xs font-medium text-accent">{insight.metric}</span>
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
