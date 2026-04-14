"use client";

import { useState, useCallback } from "react";
import {
  analyzeDeal,
  type ContentType,
  type DealAnalysis,
  type CreatorProfile,
} from "@/modules/deal-analyzer";
import { cn } from "@/lib/utils";

// --- Verdict visual config ---

const VERDICT_STYLES = {
  underpaid: {
    bg: "bg-danger/8",
    border: "border-danger/30",
    text: "text-danger",
    glow: "shadow-[0_0_24px_rgba(239,68,68,0.15)]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  fair: {
    bg: "bg-warning/8",
    border: "border-warning/30",
    text: "text-warning",
    glow: "shadow-[0_0_24px_rgba(245,158,11,0.15)]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  good: {
    bg: "bg-success/8",
    border: "border-success/30",
    text: "text-success",
    glow: "shadow-[0_0_24px_rgba(34,197,94,0.15)]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
} as const;

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "post", label: "Post" },
  { value: "reel", label: "Reel" },
  { value: "story", label: "Story" },
];

// --- Component ---

interface Props {
  creatorProfile: CreatorProfile;
}

export function DealAnalyzerWidget({ creatorProfile }: Props) {
  const [price, setPrice] = useState("");
  const [contentType, setContentType] = useState<ContentType>("reel");
  const [deliverables, setDeliverables] = useState("1");
  const [result, setResult] = useState<DealAnalysis | null>(null);

  const analyze = useCallback(() => {
    const proposedPrice = parseFloat(price);
    const count = parseInt(deliverables, 10);
    if (isNaN(proposedPrice) || proposedPrice <= 0) return;
    if (isNaN(count) || count < 1) return;

    const analysis = analyzeDeal(
      { proposedPrice, contentType, deliverables: count },
      creatorProfile
    );
    setResult(analysis);
  }, [price, contentType, deliverables, creatorProfile]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") analyze();
    },
    [analyze]
  );

  const reset = useCallback(() => {
    setResult(null);
    setPrice("");
    setDeliverables("1");
  }, []);

  const style = result ? VERDICT_STYLES[result.verdict] : null;

  return (
    <div className="rounded-2xl border border-border bg-surface-1 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          Deal Analyzer
        </h2>
        <p className="text-xs text-text-muted mt-0.5">
          Collez une offre, obtenez un verdict instantane
        </p>
      </div>

      {/* Input form */}
      <div className="px-6 py-5">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Price input */}
          <div>
            <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1.5">
              Prix propose
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={10}
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setResult(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="250"
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 pr-8 text-sm font-medium text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                EUR
              </span>
            </div>
          </div>

          {/* Content type */}
          <div>
            <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1.5">
              Type de contenu
            </label>
            <div className="flex rounded-lg border border-border bg-surface-2 p-0.5">
              {CONTENT_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => {
                    setContentType(ct.value);
                    setResult(null);
                  }}
                  className={cn(
                    "flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all duration-150 cursor-pointer",
                    contentType === ct.value
                      ? "bg-accent text-white shadow-sm"
                      : "text-text-secondary hover:text-foreground"
                  )}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1.5">
              Livrables
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={deliverables}
              onChange={(e) => {
                setDeliverables(e.target.value);
                setResult(null);
              }}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm font-medium text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
            />
          </div>
        </div>

        {/* Analyze button */}
        <button
          type="button"
          onClick={analyze}
          disabled={!price || parseFloat(price) <= 0}
          className="mt-4 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
        >
          Analyser le deal
        </button>
      </div>

      {/* Result */}
      {result && style && (
        <div
          className={cn(
            "mx-4 mb-5 rounded-xl border p-5 transition-all duration-300",
            style.border,
            style.bg,
            style.glow
          )}
        >
          {/* Verdict row */}
          <div className="flex items-center gap-3 mb-4">
            <div className={style.text}>{style.icon}</div>
            <div>
              <p className={cn("text-2xl font-bold tracking-tight", style.text)}>
                {result.verdictLabel}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                {result.explanation}
              </p>
            </div>
          </div>

          {/* Numbers */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-surface-1/60 p-3">
              <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1">
                Prix propose
              </p>
              <p className="text-lg font-bold text-foreground">
                {result.proposedPrice}
                <span className="text-xs text-text-muted ml-0.5">EUR</span>
              </p>
            </div>

            <div className="rounded-lg bg-surface-1/60 p-3">
              <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1">
                Prix juste
              </p>
              <p className="text-lg font-bold text-foreground">
                {result.fairPriceTotal}
                <span className="text-xs text-text-muted ml-0.5">EUR</span>
              </p>
              {result.deliverables > 1 && (
                <p className="text-[10px] text-text-muted">
                  {result.fairPricePerUnit} EUR x {result.deliverables}
                </p>
              )}
            </div>

            <div className="rounded-lg bg-accent/10 border border-accent/20 p-3">
              <p className="text-[10px] font-medium text-accent/70 uppercase tracking-wider mb-1">
                Vous devriez demander
              </p>
              <p className="text-lg font-bold text-accent">
                ~{result.suggestedPrice}
                <span className="text-xs text-accent/70 ml-0.5">EUR</span>
              </p>
            </div>
          </div>

          {/* Diff bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-text-muted">Ecart</span>
              <span className={cn("text-xs font-bold", style.text)}>
                {result.diffPercent > 0 ? "+" : ""}
                {result.diffPercent}%
              </span>
            </div>
            <div className="relative h-1.5 rounded-full bg-surface-3 overflow-hidden">
              {/* Fair zone marker */}
              <div
                className="absolute top-0 h-full w-px bg-text-muted/30"
                style={{ left: "50%" }}
              />
              {/* Actual position */}
              <div
                className={cn("h-full rounded-full transition-all duration-500")}
                style={{
                  width: `${Math.min(100, Math.max(5, 50 + result.diffPercent / 2))}%`,
                  background:
                    result.verdict === "underpaid"
                      ? "var(--danger)"
                      : result.verdict === "fair"
                        ? "var(--warning)"
                        : "var(--success)",
                }}
              />
            </div>
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={reset}
            className="mt-4 w-full text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          >
            Analyser un autre deal
          </button>
        </div>
      )}
    </div>
  );
}
