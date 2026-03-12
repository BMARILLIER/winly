"use client";

import { useState, useMemo } from "react";
import type { Opportunity, OpportunityCategory } from "@/modules/opportunity-detector";
import { OpportunityCard } from "./opportunity-card";

const categories: { id: OpportunityCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "viral_opportunity", label: "Viral" },
  { id: "trend_match", label: "Trend" },
  { id: "best_time_window", label: "Timing" },
  { id: "undervalued_content", label: "Undervalued" },
  { id: "consistency_gap", label: "Consistency" },
  { id: "audience_surge", label: "Audience" },
  { id: "format_opportunity", label: "Format" },
];

const urgencies = [
  { id: "all", label: "All urgency" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

const evergreenOptions = [
  { id: "all", label: "All types" },
  { id: "evergreen", label: "Evergreen" },
  { id: "timely", label: "Timely" },
];

interface OpportunityFeedProps {
  opportunities: Opportunity[];
}

export function OpportunityFeed({ opportunities }: OpportunityFeedProps) {
  const [category, setCategory] = useState<OpportunityCategory | "all">("all");
  const [urgency, setUrgency] = useState("all");
  const [evergreenFilter, setEvergreenFilter] = useState("all");

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      if (category !== "all" && o.category !== category) return false;
      if (urgency !== "all" && o.urgency !== urgency) return false;
      if (evergreenFilter === "evergreen" && !o.isEvergreen) return false;
      if (evergreenFilter === "timely" && o.isEvergreen) return false;
      return true;
    });
  }, [opportunities, category, urgency, evergreenFilter]);

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 space-y-3">
        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                category === c.id
                  ? "bg-accent text-white"
                  : "bg-surface-2 text-text-secondary hover:text-foreground hover:bg-surface-3"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        {/* Secondary filters */}
        <div className="flex gap-2">
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="rounded-lg bg-surface-2 border border-border px-3 py-1.5 text-xs text-text-secondary focus:outline-none focus:border-accent"
          >
            {urgencies.map((u) => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
          </select>
          <select
            value={evergreenFilter}
            onChange={(e) => setEvergreenFilter(e.target.value)}
            className="rounded-lg bg-surface-2 border border-border px-3 py-1.5 text-xs text-text-secondary focus:outline-none focus:border-accent"
          >
            {evergreenOptions.map((e) => (
              <option key={e.id} value={e.id}>{e.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <p className="text-sm text-text-muted py-8 text-center">No opportunities match your filters.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} />
          ))}
        </div>
      )}
    </div>
  );
}
