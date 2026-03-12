"use client";

import { useState } from "react";
import type { StrategyInsight, Recommendation, CoachAnswer } from "@/modules/coach";
import { searchCoachAnswers } from "@/modules/coach";

interface Props {
  insights: StrategyInsight[];
  recommendations: Recommendation[];
}

const STATUS_STYLES = {
  strong: "border-success/30 bg-success/15",
  warning: "border-warning/30 bg-warning/15",
  weak: "border-danger/30 bg-danger/15",
};

const STATUS_DOT = {
  strong: "bg-success",
  warning: "bg-warning",
  weak: "bg-danger",
};

const PRIORITY_STYLES = {
  high: "bg-danger/15 text-danger",
  medium: "bg-warning/15 text-warning",
  low: "bg-surface-2 text-text-secondary",
};

export function CoachUI({ insights, recommendations }: Props) {
  const [query, setQuery] = useState("");
  const [answers, setAnswers] = useState<CoachAnswer[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  function handleSearch() {
    if (!query.trim()) return;
    const results = searchCoachAnswers(query);
    setAnswers(results);
    setHasSearched(true);
  }

  return (
    <div className="space-y-8">
      {/* Strategy Insights */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Strategy Analysis</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`rounded-xl border p-4 transition-all duration-200 hover:border-border-hover ${STATUS_STYLES[insight.status]}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[insight.status]}`} />
                <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
              </div>
              <p className="text-sm text-foreground">{insight.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recommendations</h2>
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="rounded-xl border border-border bg-surface-1 p-4 transition-all duration-200 hover:border-border-hover">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLES[rec.priority]}`}
                >
                  {rec.priority}
                </span>
                <span className="text-[10px] text-text-muted font-medium uppercase">
                  {rec.category}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground">{rec.title}</h3>
              <p className="mt-1 text-sm text-text-secondary">{rec.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Q&A */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Ask Your Coach</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. How do I grow my followers?"
            className="flex-1 rounded-xl border border-border bg-surface-1 px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Ask
          </button>
        </div>

        {hasSearched && answers.length === 0 && (
          <p className="mt-4 text-sm text-text-muted">
            No answers found. Try different keywords like &quot;hashtags&quot;, &quot;engagement&quot;, or &quot;monetize&quot;.
          </p>
        )}

        {answers.length > 0 && (
          <div className="mt-4 space-y-4">
            {answers.map((a, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface-1 p-5 transition-all duration-200 hover:border-border-hover">
                <h3 className="text-sm font-semibold text-accent mb-2">{a.question}</h3>
                <p className="text-sm text-foreground leading-relaxed">{a.answer}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {a.relatedTopics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-accent-muted px-2.5 py-0.5 text-[10px] font-medium text-accent"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
