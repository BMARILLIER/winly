"use client";

import { useState } from "react";
import type { Opportunity, OpportunityCategory } from "@/modules/opportunity-detector";
import { Badge } from "./badge";
import { Card } from "./card";

const categoryIcons: Record<OpportunityCategory, string> = {
  viral_opportunity: "🔥",
  trend_match: "📈",
  best_time_window: "⏰",
  undervalued_content: "💎",
  consistency_gap: "📅",
  audience_surge: "👥",
  format_opportunity: "🎨",
};

const categoryLabels: Record<OpportunityCategory, string> = {
  viral_opportunity: "Viral",
  trend_match: "Trend",
  best_time_window: "Timing",
  undervalued_content: "Undervalued",
  consistency_gap: "Consistency",
  audience_surge: "Audience",
  format_opportunity: "Format",
};

const urgencyVariant = {
  high: "danger",
  medium: "warning",
  low: "info",
} as const;

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity: o }: OpportunityCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{categoryIcons[o.category]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="default">{categoryLabels[o.category]}</Badge>
            <Badge variant={urgencyVariant[o.urgency]}>{o.urgency}</Badge>
            {o.isEvergreen && <Badge variant="accent">evergreen</Badge>}
            <span className="ml-auto text-sm font-bold text-foreground">{o.score}</span>
          </div>
          <h4 className="text-sm font-semibold text-foreground">{o.title}</h4>
        </div>
        <svg
          className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Explanation</p>
            <p className="text-sm text-text-secondary mt-0.5">{o.explanation}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Action</p>
            <p className="text-sm text-text-secondary mt-0.5">{o.action}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Expected Impact</p>
            <p className="text-sm text-text-secondary mt-0.5">{o.expectedImpact}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
