"use client";

import { useState } from "react";
import type { TrendResult, TrendCategory } from "@/modules/trend-radar";
import { TREND_CATEGORIES } from "@/modules/trend-radar";

function getMomentumLabel(momentum: number) {
  if (momentum >= 60) return { text: "Rising fast", color: "text-success" };
  if (momentum >= 30) return { text: "Growing", color: "text-success" };
  if (momentum >= 0) return { text: "Stable", color: "text-text-secondary" };
  if (momentum >= -30) return { text: "Cooling", color: "text-warning" };
  return { text: "Declining", color: "text-danger" };
}

function getScoreBarColor(score: number) {
  if (score >= 70) return "bg-success";
  if (score >= 40) return "bg-warning";
  return "bg-danger";
}

const FILTER_OPTIONS: { value: TrendCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hashtag", label: "Hashtags" },
  { value: "topic", label: "Topics" },
  { value: "format", label: "Formats" },
];

export function TrendRadarUI({ trends }: { trends: TrendResult[] }) {
  const [filter, setFilter] = useState<TrendCategory | "all">("all");

  const filtered =
    filter === "all" ? trends : trends.filter((t) => t.category === filter);

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === opt.value
                ? "bg-accent-muted text-accent"
                : "bg-surface-2 text-text-secondary hover:bg-surface-3"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Trend cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((trend) => {
          const momentumInfo = getMomentumLabel(trend.momentum);
          const cat = TREND_CATEGORIES[trend.category];

          return (
            <div
              key={trend.topic}
              className="rounded-xl border border-border bg-surface-1 p-5 transition-all duration-200 hover:border-border-hover"
            >
              {/* Header */}
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${cat.color}`}
                >
                  {cat.label}
                </span>
                <span className={`text-xs font-medium ${momentumInfo.color}`}>
                  {momentumInfo.text}
                </span>
              </div>

              {/* Topic */}
              <h3 className="text-sm font-semibold text-foreground">
                {trend.topic}
              </h3>

              {/* Score bar */}
              <div className="mt-3 mb-1 flex items-center justify-between">
                <span className="text-xs text-text-secondary">Trend Score</span>
                <span className="text-xs font-bold text-foreground">
                  {trend.trendScore}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-2">
                <div
                  className={`h-1.5 rounded-full ${getScoreBarColor(trend.trendScore)}`}
                  style={{ width: `${trend.trendScore}%` }}
                />
              </div>

              {/* Momentum */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-text-secondary">Momentum</span>
                <span className={`text-xs font-medium ${momentumInfo.color}`}>
                  {trend.momentum > 0 ? "+" : ""}
                  {trend.momentum}
                </span>
              </div>

              {/* Hashtags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {trend.hashtags.map((h) => (
                  <span
                    key={h}
                    className="rounded bg-surface-2 px-1.5 py-0.5 text-xs text-text-secondary"
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Suggested content */}
              {trend.suggestedContent.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <p className="mb-2 text-xs font-medium text-text-secondary">
                    Content Ideas
                  </p>
                  <ul className="space-y-1">
                    {trend.suggestedContent.map((s) => (
                      <li
                        key={s}
                        className="text-xs text-foreground"
                      >
                        &bull; {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Format tag */}
              <div className="mt-3">
                <span className="inline-block rounded-full bg-accent-muted px-2 py-0.5 text-xs font-medium capitalize text-accent">
                  {trend.format}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-surface-1 p-8 text-center transition-all duration-200 hover:border-border-hover">
          <p className="text-sm text-text-secondary">No trends found for this filter.</p>
        </div>
      )}
    </div>
  );
}
