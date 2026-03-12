"use client";

import type { GrowthFactor } from "@/modules/growth-engine";
import { ProgressBar } from "./progress-bar";

interface ScoreBreakdownCardProps {
  factors: GrowthFactor[];
}

function scoreColorClass(score: number) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-danger";
}

export function ScoreBreakdownCard({ factors }: ScoreBreakdownCardProps) {
  return (
    <div className="space-y-4">
      {factors.map((f) => (
        <div key={f.id}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{f.label}</span>
              <span className="text-xs text-text-muted">{Math.round(f.weight * 100)}%</span>
            </div>
            <span className={`text-sm font-semibold ${scoreColorClass(f.score)}`}>{f.score}</span>
          </div>
          <ProgressBar value={f.score} gradient={f.score >= 50} />
          <p className="mt-1 text-xs text-text-secondary">{f.feedback}</p>
        </div>
      ))}
    </div>
  );
}
