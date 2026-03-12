"use client";

import Link from "next/link";

interface Props {
  title: string;
  action: string;
  score: number;
  urgency: "high" | "medium" | "low";
  explanation: string;
}

const urgencyStyles = {
  high: { dot: "bg-danger", label: "text-danger", badge: "bg-danger/10 text-danger" },
  medium: { dot: "bg-warning", label: "text-warning", badge: "bg-warning/10 text-warning" },
  low: { dot: "bg-info", label: "text-info", badge: "bg-info/10 text-info" },
} as const;

export function OpportunityHighlightCard({ title, action, score, urgency, explanation }: Props) {
  const s = urgencyStyles[urgency];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface-1 p-6 transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${s.dot}`} />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Opportunité principale</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">{score}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.badge}`}>{urgency}</span>
        </div>
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-text-secondary mb-3">{explanation}</p>

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-accent">{action}</p>
        <Link href="/dashboard/opportunities" className="text-xs text-text-muted hover:text-accent transition-colors">
          Voir tout →
        </Link>
      </div>
    </div>
  );
}
