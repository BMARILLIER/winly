"use client";

import type { BenchmarkComparison } from "@/modules/market-intelligence";
import { ProgressBar } from "./progress-bar";

const verdictConfig = {
  above: { color: "text-success", bg: "bg-success/15", label: "Above avg" },
  below: { color: "text-danger", bg: "bg-danger/15", label: "Below avg" },
  at: { color: "text-warning", bg: "bg-warning/15", label: "At avg" },
};

interface BenchmarkCardProps {
  comparison: BenchmarkComparison;
}

export function BenchmarkCard({ comparison: c }: BenchmarkCardProps) {
  const v = verdictConfig[c.verdict];

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{c.label}</span>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${v.bg} ${v.color}`}>
          {v.label}
        </span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-2xl font-bold ${v.color}`}>
          {typeof c.userValue === "number" && c.userValue < 1
            ? `${(c.userValue * 100).toFixed(1)}%`
            : c.userValue.toFixed(1)}
        </span>
        <span className="text-xs text-text-muted">
          vs median{" "}
          {typeof c.benchmarkP50 === "number" && c.benchmarkP50 < 1
            ? `${(c.benchmarkP50 * 100).toFixed(1)}%`
            : c.benchmarkP50.toFixed(1)}
        </span>
      </div>
      <ProgressBar value={c.percentile} gradient={c.percentile >= 50} />
      <p className="mt-2 text-xs text-text-secondary">{c.insight}</p>
    </div>
  );
}
