"use client";

import { useState } from "react";
import { calculateViralScore, BADGE_STYLES } from "@/modules/viral-score";
import type { ViralScoreResult } from "@/modules/viral-score";
import { SectionHeader, Card, CardHeader, CardTitle, Badge } from "@/components/ui";
import { Sparkles, Zap } from "lucide-react";
import { ViralScoreAIPanel } from "./viral-score-ai-panel";

const FORMATS = [
  { id: "reel", label: "Reel / Short" },
  { id: "carousel", label: "Carrousel" },
  { id: "video", label: "Vidéo" },
  { id: "thread", label: "Thread" },
  { id: "story", label: "Story" },
  { id: "text", label: "Post texte" },
  { id: "image", label: "Image" },
];

const DURATIONS = [
  { id: "short" as const, label: "< 30s" },
  { id: "medium" as const, label: "30-60s" },
  { id: "long" as const, label: "> 60s" },
];

const HOOK_LEVELS = [
  { id: "weak" as const, label: "Faible" },
  { id: "medium" as const, label: "Moyen" },
  { id: "strong" as const, label: "Fort" },
];

const TIMINGS = [
  { id: "peak" as const, label: "Heure de pointe" },
  { id: "off-peak" as const, label: "Hors pointe" },
  { id: "unknown" as const, label: "Pas sûr" },
];

const HISTORY_LEVELS = [
  { id: "low" as const, label: "Faible" },
  { id: "average" as const, label: "Moyen" },
  { id: "high" as const, label: "Élevé" },
];

interface Props {
  platform: string;
  niche: string;
}

export function ViralScoreUI({ platform, niche }: Props) {
  const [tab, setTab] = useState<"ai" | "quick">("ai");
  const [format, setFormat] = useState("reel");
  const [duration, setDuration] = useState<"short" | "medium" | "long">("short");
  const [hookStrength, setHookStrength] = useState<"weak" | "medium" | "strong">("medium");
  const [timing, setTiming] = useState<"peak" | "off-peak" | "unknown">("peak");
  const [history, setHistory] = useState<"low" | "average" | "high">("average");
  const [result, setResult] = useState<ViralScoreResult | null>(null);

  function handleCalculate() {
    const res = calculateViralScore({ format, duration, hookStrength, timing, engagementHistory: history, platform, niche });
    setResult(res);
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Viral Score"
        description="Estimez le potentiel viral de votre prochain contenu"
      />

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setTab("ai")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "ai"
              ? "border-accent text-accent"
              : "border-transparent text-text-secondary hover:text-foreground"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Analyse IA (sur ton brouillon)
        </button>
        <button
          onClick={() => setTab("quick")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "quick"
              ? "border-accent text-accent"
              : "border-transparent text-text-secondary hover:text-foreground"
          }`}
        >
          Estimation rapide
        </button>
      </div>

      {tab === "ai" && <ViralScoreAIPanel platform={platform} niche={niche} />}

      {tab === "quick" && (
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-5">
          <OptionGroup label="Format" options={FORMATS} value={format} onChange={setFormat} />
          <OptionGroup label="Durée" options={DURATIONS} value={duration} onChange={(v) => setDuration(v as typeof duration)} />
          <OptionGroup label="Qualité du hook" options={HOOK_LEVELS} value={hookStrength} onChange={(v) => setHookStrength(v as typeof hookStrength)} />
          <OptionGroup label="Timing de publication" options={TIMINGS} value={timing} onChange={(v) => setTiming(v as typeof timing)} />
          <OptionGroup label="Historique d'engagement" options={HISTORY_LEVELS} value={history} onChange={(v) => setHistory(v as typeof history)} />

          <button
            onClick={handleCalculate}
            className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Calculer le score
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-6">
            {/* Score hero */}
            <Card>
              <div className="flex items-center gap-6 p-6">
                <div className="relative h-28 w-28 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface-3)" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={result.score >= 70 ? "#22c55e" : result.score >= 40 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(result.score / 100) * 264} 264`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">{result.score}</span>
                    <span className="text-[10px] text-text-muted">/ 100</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-accent" />
                    <span className="text-lg font-semibold text-foreground">Viral Score</span>
                  </div>
                  <div className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${BADGE_STYLES[result.badge].color}`}>
                    {BADGE_STYLES[result.badge].label}
                  </div>
                </div>
              </div>
            </Card>

            {/* Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Détail des facteurs</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {result.factors.map((f) => (
                  <div key={f.id} className="rounded-lg bg-surface-2 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{f.label}</span>
                      <span className="text-sm font-bold text-foreground">{f.score}/{f.maxPoints}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-3 mb-2">
                      <div
                        className={`h-1.5 rounded-full ${f.score / f.maxPoints >= 0.7 ? "bg-success" : f.score / f.maxPoints >= 0.4 ? "bg-warning" : "bg-danger"}`}
                        style={{ width: `${(f.score / f.maxPoints) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-secondary">{f.feedback}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Suggestion */}
            <div className="rounded-xl border border-border bg-accent-muted p-4">
              <p className="text-sm text-accent font-medium">Conseil : {result.suggestion}</p>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              value === o.id
                ? "bg-accent text-white"
                : "bg-surface-2 text-text-secondary hover:bg-surface-3"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
