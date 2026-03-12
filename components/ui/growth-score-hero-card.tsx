"use client";

interface Props {
  score: number;
  grade: string;
  label: "High" | "Medium" | "Low";
  explanation: string;
}

const labelColors = {
  High: { bg: "bg-success/10", text: "text-success", ring: "stroke-[#22c55e]" },
  Medium: { bg: "bg-warning/10", text: "text-warning", ring: "stroke-[#f59e0b]" },
  Low: { bg: "bg-danger/10", text: "text-danger", ring: "stroke-[#ef4444]" },
} as const;

export function GrowthScoreHeroCard({ score, grade, label, explanation }: Props) {
  const c = labelColors[label];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface-1 p-8 transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent/5 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-50" />

      <div className="flex items-center gap-8">
        {/* Score ring */}
        <div className="relative h-36 w-36 shrink-0">
          <svg className="h-36 w-36 -rotate-90" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r="62" fill="none" stroke="var(--surface-3)" strokeWidth="10" />
            <circle
              cx="72" cy="72" r="62" fill="none"
              className={c.ring}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 390} 390`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${c.text}`}>{score}</span>
            <span className="text-xs text-text-muted mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-foreground">Growth Score</h2>
            <span className="rounded-full bg-surface-3 px-2.5 py-0.5 text-sm font-bold text-foreground">{grade}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.bg} ${c.text}`}>{label}</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{explanation}</p>
        </div>
      </div>
    </div>
  );
}
