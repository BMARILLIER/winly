"use client";

import { useState } from "react";
import type { RevenueControlData, RevenueAction } from "@/modules/revenue-control";

// --- Helpers ---

function formatEuro(n: number): string {
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

const TREND_ICON = { up: "↑", down: "↓", stable: "→" } as const;
const TREND_COLOR = {
  up: "text-success",
  down: "text-danger",
  stable: "text-text-secondary",
} as const;

const STRATEGY_STYLE = {
  aggressive: { label: "Aggressive", color: "bg-success/15 text-success" },
  balanced: { label: "Balanced", color: "bg-info/15 text-info" },
  soft: { label: "Soft", color: "bg-warning/15 text-warning" },
} as const;

const TIMING_STYLE = {
  now: { label: "Maintenant", color: "bg-danger/15 text-danger" },
  soon: { label: "Bientot", color: "bg-warning/15 text-warning" },
  later: { label: "Plus tard", color: "bg-surface-3 text-text-muted" },
} as const;

const EFFORT_LABEL = {
  quick: "Rapide",
  medium: "Moyen",
  ongoing: "Continu",
} as const;

interface Props {
  data: RevenueControlData;
  monthlyMin: number;
  monthlyMax: number;
}

export function RevenueControlUI({ data, monthlyMin, monthlyMax }: Props) {
  const trendStyle = TREND_COLOR[data.trend];
  const trendIcon = TREND_ICON[data.trend];
  const strategyStyle = STRATEGY_STYLE[data.strategy];

  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    count: number;
    totalImpact: number;
  } | null>(null);

  const eligibleActions = data.topActions.filter(
    (a) => a.status === "pending" && (a.timing === "now" || a.timing === "soon"),
  ).slice(0, 10);

  async function handleGenerateRevenue() {
    if (executing || eligibleActions.length === 0) return;
    setExecuting(true);
    setExecutionResult(null);

    // Simulate execution delay
    await new Promise((r) => setTimeout(r, 1800));

    const totalImpact = eligibleActions.reduce((sum, a) => sum + a.expectedImpact, 0);
    setExecutionResult({ count: eligibleActions.length, totalImpact });
    setExecuting(false);
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Revenue Control Center</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${strategyStyle.color}`}>
            {strategyStyle.label}
          </span>
        </div>
        <p className="mt-2 text-sm text-text-secondary">{data.summary}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {/* CA Aujourd'hui */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-surface-1 to-surface-2 p-6">
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-3">
            CA aujourd&apos;hui
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {formatEuro(data.revenueToday)}
            </p>
            <span className={`text-lg font-bold ${trendStyle}`}>{trendIcon}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            {formatEuro(monthlyMin)} - {formatEuro(monthlyMax)} EUR/mois
          </p>
        </div>

        {/* CA Potentiel */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-surface-1 to-surface-2 p-6">
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-3">
            CA potentiel
          </p>
          <p className="text-3xl font-bold text-accent tracking-tight">
            +{formatEuro(data.revenuePotential)}
          </p>
          <p className="text-xs text-text-muted mt-1">EUR/mois si actions completees</p>
        </div>

        {/* CA Genere */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-surface-1 to-surface-2 p-6">
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-3">
            CA genere par actions
          </p>
          <p className="text-3xl font-bold text-success tracking-tight">
            +{formatEuro(data.revenueFromActions)}
          </p>
          <p className="text-xs text-text-muted mt-1">EUR/mois deja captures</p>
        </div>
      </div>

      {/* Generate Revenue Now */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <button
          type="button"
          disabled={executing || eligibleActions.length === 0}
          onClick={handleGenerateRevenue}
          className="group relative w-full sm:w-auto rounded-2xl bg-accent px-8 py-4 text-center shadow-lg transition-all hover:bg-accent-hover hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="block text-base font-bold text-white tracking-wide">
            {executing ? "Execution en cours..." : "Generate Revenue Now"}
          </span>
          <span className="block mt-0.5 text-xs text-white/70">
            {eligibleActions.length > 0
              ? `Execute top eligible actions — ${eligibleActions.length} actions eligibles`
              : "Aucune action eligible"}
          </span>
          {executing && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </span>
          )}
        </button>

        {executionResult && (
          <div className="w-full rounded-xl border border-success/30 bg-success/10 px-5 py-3 text-center">
            <p className="text-sm font-semibold text-success">
              {executionResult.count} actions executees — +{executionResult.totalImpact} EUR/mois captures
            </p>
          </div>
        )}
      </div>

      {/* Top 5 Actions */}
      <div className="rounded-2xl border border-border bg-surface-1 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            Top actions a faire
          </h2>
        </div>

        {data.topActions.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-text-secondary">
            Completez votre Score pour generer des actions personnalisees.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.topActions.map((action, i) => (
              <ActionRow key={action.id} action={action} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionRow({ action, rank }: { action: RevenueAction; rank: number }) {
  const timingStyle = TIMING_STYLE[action.timing];
  const isDone = action.status === "done";

  return (
    <div className={`flex items-center gap-4 px-6 py-4 ${isDone ? "opacity-50" : ""}`}>
      {/* Rank */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-foreground">
        {rank}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`text-sm font-medium text-foreground truncate ${isDone ? "line-through" : ""}`}>
            {action.title}
          </p>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${timingStyle.color}`}>
            {timingStyle.label}
          </span>
        </div>
        <p className="text-xs text-text-muted truncate">{action.pillar} · {EFFORT_LABEL[action.effort]}</p>
      </div>

      {/* Priority score */}
      <div className="text-right shrink-0">
        <p className="text-lg font-bold text-foreground">{action.priorityScore}</p>
        <p className="text-[10px] text-text-muted">score</p>
      </div>

      {/* Impact */}
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-sm font-semibold text-accent">+{action.expectedImpact}</p>
        <p className="text-[10px] text-text-muted">EUR/mois</p>
      </div>
    </div>
  );
}
