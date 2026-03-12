"use client";

import Link from "next/link";

interface Props {
  title: string;
  why: string;
  trigger: string;
  impact: "high" | "medium" | "low";
  targetFactor: string;
}

const impactStyles = {
  high: "bg-danger/10 text-danger",
  medium: "bg-warning/10 text-warning",
  low: "bg-info/10 text-info",
} as const;

export function BestActionCard({ title, why, trigger, impact, targetFactor }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface-1 p-6 transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Meilleure action du jour</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${impactStyles[impact]}`}>impact {impact}</span>
      </div>

      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>

      <div className="space-y-2 mb-4">
        <div>
          <span className="text-xs font-medium text-text-muted">Pourquoi : </span>
          <span className="text-sm text-text-secondary">{why}</span>
        </div>
        <div>
          <span className="text-xs font-medium text-text-muted">Action : </span>
          <span className="text-sm text-text-secondary">{trigger}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">Cible : {targetFactor}</span>
        <Link href="/dashboard/insights" className="text-xs text-text-muted hover:text-accent transition-colors">
          Tous les insights →
        </Link>
      </div>
    </div>
  );
}
