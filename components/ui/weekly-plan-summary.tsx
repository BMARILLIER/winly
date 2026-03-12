"use client";

import Link from "next/link";

interface WeeklyAction {
  day: string;
  task: string;
  category: "content" | "engagement" | "strategy" | "learning";
}

interface Props {
  actions: WeeklyAction[];
  focusArea: string;
}

const categoryColors: Record<string, string> = {
  content: "bg-accent/10 text-accent",
  engagement: "bg-success/10 text-success",
  strategy: "bg-warning/10 text-warning",
  learning: "bg-info/10 text-info",
};

export function WeeklyPlanSummary({ actions, focusArea }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface-1 p-6 transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Stratégie hebdomadaire</span>
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">{focusArea}</span>
      </div>

      <div className="space-y-2.5">
        {actions.map((a, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-10 shrink-0 text-xs font-medium text-text-muted">{a.day}</span>
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-foreground">{a.task}</span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryColors[a.category]}`}>
              {a.category}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Link href="/missions" className="text-xs text-text-muted hover:text-accent transition-colors">
          Voir les missions →
        </Link>
      </div>
    </div>
  );
}
