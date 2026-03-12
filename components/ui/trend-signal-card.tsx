"use client";

import Link from "next/link";
import type { TrendDirection } from "@/types";

interface Props {
  title: string;
  direction: TrendDirection;
  score: number;
  category: string;
  action: string;
}

const directionStyles: Record<TrendDirection, { icon: string; label: string; color: string; bg: string }> = {
  rising: { icon: "↑", label: "En hausse", color: "text-success", bg: "bg-success/10" },
  stable: { icon: "→", label: "Stable", color: "text-info", bg: "bg-info/10" },
  fading: { icon: "↓", label: "En baisse", color: "text-warning", bg: "bg-warning/10" },
};

const categoryLabels: Record<string, string> = {
  trending_topic: "Sujet tendance",
  emerging_format: "Format émergent",
  rising_niche: "Niche en croissance",
  trend_signal: "Signal de tendance",
  low_saturation: "Faible saturation",
};

export function TrendSignalCard({ title, direction, score, category, action }: Props) {
  const d = directionStyles[direction];
  const catLabel = categoryLabels[category] ?? category;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface-1 p-6 transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">{catLabel}</span>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${d.bg} ${d.color}`}>
            {d.icon} {d.label}
          </span>
          <span className="text-lg font-bold text-foreground">{score}</span>
        </div>
      </div>

      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-text-secondary mb-3">{action}</p>

      <div className="flex items-center justify-end">
        <Link href="/trend-radar" className="text-xs text-text-muted hover:text-accent transition-colors">
          Tous les signaux →
        </Link>
      </div>
    </div>
  );
}
