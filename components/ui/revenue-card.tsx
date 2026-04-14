"use client";

import type { RevenueReport } from "@/modules/revenue";

const GROWTH_STYLES: Record<
  string,
  { color: string; bg: string }
> = {
  explosive: { color: "text-success", bg: "bg-success/10" },
  strong: { color: "text-info", bg: "bg-info/10" },
  moderate: { color: "text-warning", bg: "bg-warning/10" },
  early: { color: "text-text-secondary", bg: "bg-surface-2" },
};

function formatEuro(n: number): string {
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function RevenueCard({ report }: { report: RevenueReport }) {
  const growth = GROWTH_STYLES[report.growthPotential] ?? GROWTH_STYLES.early;

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-surface-1 to-surface-2 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">Revenue</h2>
          <p className="text-xs text-text-muted mt-0.5">{report.tierLabel}</p>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${growth.color} ${growth.bg}`}>
          {report.growthPotentialLabel}
        </div>
      </div>

      {/* Big numbers grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Monthly earnings */}
        <div className="rounded-xl bg-surface-1 border border-border p-4">
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2">
            Revenus / mois
          </p>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {formatEuro(report.monthlyEarningsMin)} - {formatEuro(report.monthlyEarningsMax)}
            <span className="text-sm text-text-muted ml-1">EUR</span>
          </p>
        </div>

        {/* Post value */}
        <div className="rounded-xl bg-surface-1 border border-border p-4">
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2">
            Valeur / post
          </p>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {report.postValueMin} - {report.postValueMax}
            <span className="text-sm text-text-muted ml-1">EUR</span>
          </p>
        </div>
      </div>

      {/* Account value score */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-text-secondary">
              Valeur du compte
            </span>
            <span className="text-sm font-bold text-foreground">
              {report.accountValueScore}/100
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${report.accountValueScore}%`,
                background:
                  report.accountValueScore >= 70
                    ? "var(--success)"
                    : report.accountValueScore >= 40
                      ? "var(--warning)"
                      : "var(--danger)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
