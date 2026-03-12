"use client";

import { useState } from "react";
import {
  predictContent,
  PREDICTION_FORMATS,
  REACH_STYLES,
  RATE_STYLES,
} from "@/modules/predictor";
import type { PredictionResult } from "@/modules/predictor";

interface Props {
  platform: string;
  profileType: string;
  niche: string;
}

const GRADE_COLORS: Record<string, string> = {
  A: "text-success bg-success/15 border-border",
  B: "text-info bg-info/15 border-border",
  C: "text-warning bg-warning/15 border-border",
  D: "text-warning bg-warning/15 border-border",
  F: "text-danger bg-danger/15 border-border",
};

export function PredictorUI({ platform, profileType, niche }: Props) {
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [caption, setCaption] = useState("");
  const [cta, setCta] = useState("");
  const [format, setFormat] = useState("reel");
  const [result, setResult] = useState<PredictionResult | null>(null);

  function handlePredict() {
    if (!title.trim() && !hook.trim() && !caption.trim()) return;
    const prediction = predictContent({
      title,
      hook,
      caption,
      cta,
      format,
      platform,
      niche,
      profileType,
    });
    setResult(prediction);
  }

  function handleReset() {
    setTitle("");
    setHook("");
    setCaption("");
    setCta("");
    setFormat("reel");
    setResult(null);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Input form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 5 mistakes killing your growth"
            className="w-full rounded-xl border px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Hook</label>
          <input
            type="text"
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            placeholder="e.g. Most people get this wrong about hashtags..."
            className="w-full rounded-xl border px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={5}
            placeholder="Your full caption or script..."
            className="w-full rounded-xl border px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Call to Action</label>
          <input
            type="text"
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            placeholder="e.g. Save this for later and share with a friend"
            className="w-full rounded-xl border px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Format</label>
          <div className="flex flex-wrap gap-2">
            {PREDICTION_FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  format === f.id
                    ? "bg-accent text-white"
                    : "bg-surface-2 text-text-secondary hover:bg-surface-3"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handlePredict}
            disabled={!title.trim() && !hook.trim() && !caption.trim()}
            className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Predict Performance
          </button>
          {result && (
            <button
              onClick={handleReset}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Score + Grade */}
          <div className="flex items-center gap-6">
            {/* Circular score */}
            <div className="relative h-28 w-28 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface-3)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={result.score >= 70 ? "#8b5cf6" : result.score >= 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(result.score / 100) * 264} 264`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{result.score}</span>
                <span className="text-[10px] text-text-muted">/ 100</span>
              </div>
            </div>

            {/* Grade */}
            <div>
              <div
                className={`inline-flex items-center justify-center h-14 w-14 rounded-xl border-2 text-2xl font-bold ${GRADE_COLORS[result.grade]}`}
              >
                {result.grade}
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                {result.score >= 85
                  ? "Excellent content — ready to post!"
                  : result.score >= 70
                    ? "Strong content with minor improvements possible."
                    : result.score >= 50
                      ? "Decent but needs work on weak areas."
                      : "Needs significant improvement before posting."}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Factor Breakdown</h3>
            <div className="space-y-3">
              {result.breakdown.map((factor) => (
                <div key={factor.id} className="rounded-xl border border-border bg-surface-1 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {factor.label}
                      <span className="ml-1 text-[10px] text-text-muted">({factor.weight}%)</span>
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        factor.score >= 70
                          ? "text-success"
                          : factor.score >= 50
                            ? "text-warning"
                            : "text-danger"
                      }`}
                    >
                      {factor.score}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-2 mb-2">
                    <div
                      className={`h-1.5 rounded-full ${
                        factor.score >= 70
                          ? "bg-success"
                          : factor.score >= 50
                            ? "bg-warning"
                            : "bg-danger"
                      }`}
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-secondary">{factor.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Predictions */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Engagement Prediction</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-surface-1 p-3">
                <p className="text-[10px] text-text-muted uppercase font-medium">Reach</p>
                <p className={`text-sm font-semibold ${REACH_STYLES[result.predictions.reachLevel].color}`}>
                  {REACH_STYLES[result.predictions.reachLevel].label}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-1 p-3">
                <p className="text-[10px] text-text-muted uppercase font-medium">Saves</p>
                <p className={`text-sm font-semibold ${RATE_STYLES[result.predictions.saveRate].color}`}>
                  {RATE_STYLES[result.predictions.saveRate].label}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-1 p-3">
                <p className="text-[10px] text-text-muted uppercase font-medium">Shares</p>
                <p className={`text-sm font-semibold ${RATE_STYLES[result.predictions.shareRate].color}`}>
                  {RATE_STYLES[result.predictions.shareRate].label}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-1 p-3">
                <p className="text-[10px] text-text-muted uppercase font-medium">Comments</p>
                <p className={`text-sm font-semibold ${RATE_STYLES[result.predictions.commentRate].color}`}>
                  {RATE_STYLES[result.predictions.commentRate].label}
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-border bg-accent-muted p-3">
              <p className="text-xs text-accent">
                <span className="font-semibold">Best time to post:</span>{" "}
                {result.predictions.bestTimeToPost}
              </p>
            </div>
          </div>

          {/* Tips */}
          {result.tips.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Tips to Improve</h3>
              <div className="space-y-2">
                {result.tips.map((tip, i) => (
                  <div key={i} className="flex gap-2 rounded-xl border border-border bg-surface-1 p-3">
                    <span className="flex-shrink-0 text-warning text-sm">💡</span>
                    <p className="text-sm text-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
