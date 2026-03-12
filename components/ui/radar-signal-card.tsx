"use client";

import { useState } from "react";
import type { RadarSignal } from "@/modules/social-radar";
import { SIGNAL_CATEGORIES } from "@/modules/social-radar";
import { Badge } from "./badge";
import { Card } from "./card";
import { TrendDirectionBadge } from "./trend-direction-badge";
import { ProgressBar } from "./progress-bar";

interface RadarSignalCardProps {
  signal: RadarSignal;
}

export function RadarSignalCard({ signal: s }: RadarSignalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cat = SIGNAL_CATEGORIES[s.category];

  return (
    <Card className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">{cat.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge variant="default">{cat.label}</Badge>
            <TrendDirectionBadge direction={s.direction} />
            <span className="text-xs text-text-muted">{s.confidence}% conf.</span>
            <span className="ml-auto text-sm font-bold text-foreground">{s.score}</span>
          </div>
          <h4 className="text-sm font-semibold text-foreground">{s.title}</h4>
          <div className="mt-2">
            <ProgressBar value={s.score} gradient={s.score >= 60} />
          </div>
          {s.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {s.tags.map((tag) => (
                <span key={tag} className="text-xs bg-surface-2 text-text-muted rounded px-1.5 py-0.5">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <svg
          className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          viewBox="0 0 16 16" fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Recommended Format</p>
            <p className="text-sm text-text-secondary mt-0.5 capitalize">{s.recommendedFormat}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Recommended Action</p>
            <p className="text-sm text-text-secondary mt-0.5">{s.recommendedAction}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
