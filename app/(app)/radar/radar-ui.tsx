"use client";

import { useState } from "react";
import type { Opportunity } from "@/modules/radar";
import { CATEGORIES, URGENCY_LABELS } from "@/modules/radar";

interface Props {
  opportunities: Opportunity[];
}

type FilterCategory = Opportunity["category"] | "all";

export function RadarUI({ opportunities }: Props) {
  const [filter, setFilter] = useState<FilterCategory>("all");

  const filtered =
    filter === "all"
      ? opportunities
      : opportunities.filter((o) => o.category === filter);

  const categories: FilterCategory[] = ["all", "trending", "evergreen", "seasonal", "reactive", "gap"];

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => {
          const isActive = filter === cat;
          const catInfo = cat === "all" ? null : CATEGORIES[cat];
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-accent text-white"
                  : "bg-surface-2 text-text-secondary hover:bg-surface-3"
              }`}
            >
              {cat === "all" ? "All" : catInfo?.label ?? cat}
            </button>
          );
        })}
      </div>

      {/* Opportunity cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-1 p-8 text-center transition-all duration-200 hover:border-border-hover">
          <p className="text-sm text-text-muted">No opportunities in this category.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((opp) => {
            const catInfo = CATEGORIES[opp.category];
            const urgencyInfo = URGENCY_LABELS[opp.urgency];
            return (
              <div
                key={opp.id}
                className="rounded-xl border border-border bg-surface-1 p-5 flex flex-col transition-all duration-200 hover:border-border-hover"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold ${catInfo.color}`}
                  >
                    {catInfo.label}
                  </span>
                  <span className={`text-[10px] font-medium ${urgencyInfo.color}`}>
                    {urgencyInfo.label}
                  </span>
                </div>

                {/* Score bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                      {opp.title}
                    </h3>
                    <span className="text-xs font-bold text-accent ml-2">
                      {opp.score}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-2">
                    <div
                      className="h-1.5 rounded-full bg-violet-500"
                      style={{ width: `${opp.score}%` }}
                    />
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-text-secondary mb-2">{opp.description}</p>

                {/* Angle */}
                <div className="rounded-lg bg-accent-muted p-2.5 mb-3">
                  <p className="text-xs text-accent">
                    <span className="font-semibold">Angle:</span> {opp.angle}
                  </p>
                </div>

                {/* Formats */}
                <div className="mt-auto flex flex-wrap gap-1">
                  {opp.formats.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-text-secondary font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
