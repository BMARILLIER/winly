"use client";

import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  CalendarDays,
  Heart,
  Eye,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Recommendation } from "@/modules/recommendations";

const ICONS: Record<string, LucideIcon> = {
  "trending-up": TrendingUp,
  "alert-triangle": AlertTriangle,
  zap: Zap,
  target: Target,
  calendar: CalendarDays,
  heart: Heart,
  eye: Eye,
};

const IMPACT_STYLES: Record<string, { dot: string; border: string }> = {
  high: { dot: "bg-danger", border: "border-danger/20" },
  medium: { dot: "bg-warning", border: "border-warning/20" },
  low: { dot: "bg-success", border: "border-success/20" },
};

export function RecommendationsCard({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  if (recommendations.length === 0) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          A faire maintenant
        </h2>
        <span className="text-xs text-text-muted">
          {recommendations.length} action{recommendations.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const Icon = ICONS[rec.icon] ?? Zap;
          const style = IMPACT_STYLES[rec.impact] ?? IMPACT_STYLES.medium;

          return (
            <div
              key={rec.id}
              className={`rounded-xl border ${style.border} bg-surface-1 p-4 transition-all duration-200 hover:border-border-hover hover:bg-surface-2`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-3">
                  <Icon className="h-4 w-4 text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {rec.title}
                    </h3>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
