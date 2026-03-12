"use client";

import { useState } from "react";
import type { GrowthRecommendation } from "@/modules/growth-engine";
import { Badge } from "./badge";
import { Card } from "./card";

interface RecommendationItemProps {
  recommendation: GrowthRecommendation;
}

const impactVariant = {
  high: "danger",
  medium: "warning",
  low: "info",
} as const;

function RecommendationItem({ recommendation: r }: RecommendationItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={impactVariant[r.impact]}>impact {r.impact}</Badge>
          </div>
          <h4 className="text-sm font-semibold text-foreground">{r.title}</h4>
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
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Pourquoi</p>
            <p className="text-sm text-text-secondary mt-0.5">{r.why}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Action</p>
            <p className="text-sm text-text-secondary mt-0.5">{r.trigger}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

interface RecommendationListProps {
  recommendations: GrowthRecommendation[];
}

export function RecommendationList({ recommendations }: RecommendationListProps) {
  return (
    <div className="space-y-3">
      {recommendations.map((r) => (
        <RecommendationItem key={r.id} recommendation={r} />
      ))}
    </div>
  );
}
