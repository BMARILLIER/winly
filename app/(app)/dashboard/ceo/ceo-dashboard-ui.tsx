"use client";

import { useState } from "react";
import Link from "next/link";
import type { RevenueControlData, RevenueAction } from "@/modules/revenue-control";
import type { ChatterScore } from "@/modules/star-engine";

// --- Helpers ---

function formatEuro(n: number): string {
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

const TREND = {
  up: { icon: "↑", color: "text-success", label: "En hausse" },
  down: { icon: "↓", color: "text-danger", label: "En baisse" },
  stable: { icon: "→", color: "text-text-secondary", label: "Stable" },
} as const;

const STATUS_STYLE = {
  star: { label: "Star", color: "bg-warning/15 text-warning" },
  normal: { label: "Normal", color: "bg-info/15 text-info" },
  weak: { label: "Weak", color: "bg-danger/15 text-danger" },
} as const;

const TIMING_STYLE = {
  now: { label: "Now", color: "bg-danger/15 text-danger" },
  soon: { label: "Soon", color: "bg-warning/15 text-warning" },
  later: { label: "Later", color: "bg-surface-3 text-text-muted" },
} as const;

interface Props {
  controlData: RevenueControlData;
  monthlyMin: number;
  monthlyMax: number;
  topChatters: ChatterScore[];
}

export function CeoDashboardUI({ controlData, monthlyMin, monthlyMax, topChatters }: Props) {
  const trend = TREND[controlData.trend];

  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    count: number;
    totalImpact: number;
  } | null>(null);

  const eligibleActions = controlData.topActions.filter(
    (a) => a.status === "pending" && (a.timing === "now" || a.timing === "soon"),
  ).slice(0, 10);

  async function handleApplyAll() {
    if (executing || eligibleActions.length === 0) return;
    setExecuting(true);
    setExecutionResult(null);
    await new Promise((r) => setTimeout(r, 1500));
    const totalImpact = eligibleActions.reduce((sum, a) => sum + a.expectedImpact, 0);
    setExecutionResult({ count: eligibleActions.length, totalImpact });
    setExecuting(false);
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CEO Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {controlData.summary}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 ${trend.color}`}>
          <span className="text-lg font-bold">{trend.icon}</span>
          <span className="text-xs font-medium">{trend.label}</span>
        </div>
      </div>

      {/* ═══ KPIs ═══ */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        <KpiCard
          label="CA aujourd'hui"
          value={formatEuro(controlData.revenueToday)}
          unit="EUR"
          sub={`${formatEuro(monthlyMin)} - ${formatEuro(monthlyMax)}/mois`}
          accent={false}
        />
        <KpiCard
          label="CA potentiel"
          value={`+${formatEuro(controlData.revenuePotential)}`}
          unit="EUR/mois"
          sub="si actions completees"
          accent
        />
        <KpiCard
          label="CA genere"
          value={`+${formatEuro(controlData.revenueFromActions)}`}
          unit="EUR/mois"
          sub="par actions faites"
          accent={false}
          success
        />
        <KpiCard
          label="Tendance"
          value={trend.icon}
          unit=""
          sub={trend.label}
          accent={false}
          trendColor={trend.color}
        />
      </div>

      {/* ═══ 2 columns: Actions + Chatters ═══ */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Top 5 Actions — 2/3 width */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface-1 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Top 5 actions</h2>
            <button
              type="button"
              disabled={executing || eligibleActions.length === 0}
              onClick={handleApplyAll}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {executing ? "..." : `Apply (${eligibleActions.length})`}
            </button>
          </div>

          {executionResult && (
            <div className="mx-6 mt-3 rounded-lg border border-success/30 bg-success/10 px-4 py-2 text-center">
              <p className="text-xs font-semibold text-success">
                {executionResult.count} executees — +{executionResult.totalImpact} EUR/mois
              </p>
            </div>
          )}

          {controlData.topActions.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-text-secondary">
              Completez votre Score pour debloquer les actions.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {controlData.topActions.map((action, i) => (
                <ActionRow key={action.id} action={action} rank={i + 1} />
              ))}
            </div>
          )}
        </div>

        {/* Top 3 Chatters — 1/3 width */}
        <div className="rounded-2xl border border-border bg-surface-1 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Top chatteurs</h2>
            <span className="text-[10px] text-text-muted">Star Engine</span>
          </div>

          <div className="divide-y divide-border">
            {topChatters.map((chatter, i) => (
              <ChatterRow key={chatter.id} chatter={chatter} rank={i + 1} />
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Quick links ═══ */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/revenue/control"
          className="rounded-lg border border-border bg-surface-1 px-4 py-2 text-xs font-medium text-text-secondary hover:text-foreground hover:border-border-hover transition-colors"
        >
          Revenue Control Center →
        </Link>
        <Link
          href="/revenue"
          className="rounded-lg border border-border bg-surface-1 px-4 py-2 text-xs font-medium text-text-secondary hover:text-foreground hover:border-border-hover transition-colors"
        >
          Revenue Details →
        </Link>
        <Link
          href="/score"
          className="rounded-lg border border-border bg-surface-1 px-4 py-2 text-xs font-medium text-text-secondary hover:text-foreground hover:border-border-hover transition-colors"
        >
          Score →
        </Link>
      </div>
    </div>
  );
}

// --- Sub-components ---

function KpiCard({
  label,
  value,
  unit,
  sub,
  accent,
  success,
  trendColor,
}: {
  label: string;
  value: string;
  unit: string;
  sub: string;
  accent?: boolean;
  success?: boolean;
  trendColor?: string;
}) {
  const valueColor = trendColor
    ? trendColor
    : success
      ? "text-success"
      : accent
        ? "text-accent"
        : "text-foreground";

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-surface-1 to-surface-2 p-5">
      <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className={`text-2xl font-bold tracking-tight ${valueColor}`}>
        {value}
        {unit && <span className="text-sm text-text-muted ml-1">{unit}</span>}
      </p>
      <p className="text-[10px] text-text-muted mt-1">{sub}</p>
    </div>
  );
}

function ActionRow({ action, rank }: { action: RevenueAction; rank: number }) {
  const timing = TIMING_STYLE[action.timing];
  const isDone = action.status === "done";

  return (
    <div className={`flex items-center gap-3 px-6 py-3 ${isDone ? "opacity-40" : ""}`}>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[11px] font-bold text-foreground">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-foreground truncate ${isDone ? "line-through" : ""}`}>
          {action.title}
        </p>
      </div>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${timing.color}`}>
        {timing.label}
      </span>
      <div className="text-right shrink-0 w-12">
        <p className="text-sm font-bold text-foreground">{action.priorityScore}</p>
      </div>
      <div className="text-right shrink-0 w-16 hidden sm:block">
        <p className="text-xs font-semibold text-accent">+{action.expectedImpact}</p>
      </div>
    </div>
  );
}

function ChatterRow({ chatter, rank }: { chatter: ChatterScore; rank: number }) {
  const statusStyle = STATUS_STYLE[chatter.status];

  return (
    <div className="flex items-center gap-3 px-6 py-4">
      {/* Rank medal */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
        rank === 1 ? "bg-warning/20 text-warning" : "bg-surface-2 text-foreground"
      }`}>
        {rank}
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{chatter.name}</p>
        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium mt-0.5 ${statusStyle.color}`}>
          {statusStyle.label}
        </span>
      </div>

      {/* Score */}
      <div className="text-right shrink-0">
        <p className="text-lg font-bold text-foreground">{chatter.score}</p>
        <p className="text-[10px] text-text-muted">score</p>
      </div>

      {/* Revenue */}
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-sm font-semibold text-success">{formatEuro(chatter.revenue)}</p>
        <p className="text-[10px] text-text-muted">EUR</p>
      </div>
    </div>
  );
}
