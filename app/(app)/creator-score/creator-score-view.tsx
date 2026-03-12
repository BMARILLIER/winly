"use client";

import { useActionState } from "react";
import {
  calculateCreatorScore,
  type CreatorScoreState,
} from "@/lib/actions/creator-score";
import type { CreatorScoreReport } from "@/modules/creator-score";

function getScoreColor(score: number) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-danger";
}

function getBarColor(score: number) {
  if (score >= 70) return "bg-success";
  if (score >= 40) return "bg-warning";
  return "bg-danger";
}

function getGradeColor(grade: string) {
  if (grade.startsWith("A")) return "bg-success/15 text-success";
  if (grade === "B") return "bg-info/15 text-info";
  if (grade === "C") return "bg-warning/15 text-warning";
  return "bg-danger/15 text-danger";
}

export function CreatorScoreView({
  report,
  lastUpdated,
}: {
  report: CreatorScoreReport | null;
  lastUpdated: string | null;
}) {
  const [state, formAction, pending] = useActionState<
    CreatorScoreState,
    FormData
  >(calculateCreatorScore, null);

  return (
    <div>
      {state?.error && (
        <div className="mb-6 rounded-lg bg-danger/15 p-4 text-sm text-danger">
          {state.error}
        </div>
      )}

      {/* Calculate button */}
      <form action={formAction} className="mb-8">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {pending
            ? "Calculating..."
            : report
              ? "Recalculate Score"
              : "Calculate my Creator Score"}
        </button>
        {lastUpdated && (
          <span className="ml-4 text-xs text-text-muted">
            Last updated: {new Date(lastUpdated).toLocaleDateString()}
          </span>
        )}
      </form>

      {report && (
        <>
          {/* Global score */}
          <div className="mb-8 rounded-xl border border-border bg-surface-1 p-6 transition-all duration-200 hover:border-border-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">
                  Creator Score
                </p>
                <p className={`mt-1 text-4xl font-bold ${getScoreColor(report.score)}`}>
                  {report.score} / 100
                </p>
              </div>
              <span
                className={`rounded-full px-4 py-1.5 text-lg font-bold ${getGradeColor(report.grade)}`}
              >
                {report.grade}
              </span>
            </div>
            <p className="mt-4 text-sm text-text-secondary">{report.advice}</p>
          </div>

          {/* Factor breakdown */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Score Breakdown
            </h2>
            {report.details.map((factor) => (
              <div
                key={factor.id}
                className="rounded-xl border border-border bg-surface-1 p-5 transition-all duration-200 hover:border-border-hover"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {factor.label}
                  </span>
                  <span
                    className={`text-sm font-bold ${getScoreColor(factor.score)}`}
                  >
                    {factor.score}
                  </span>
                </div>
                <div className="mb-2 h-2 w-full rounded-full bg-surface-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getBarColor(factor.score)}`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
                <p className="text-xs text-text-secondary">{factor.description}</p>
                <span className="mt-1 inline-block text-xs text-text-muted">
                  Weight: {Math.round(factor.weight * 100)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
