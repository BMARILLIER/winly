"use client";

import { useState, useMemo } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { Card } from "@/components/ui/card";
import { RadarSignalCard } from "@/components/ui/radar-signal-card";
import { TrendDirectionBadge } from "@/components/ui/trend-direction-badge";
import { mockSocialRadarReport } from "@/lib/mock/social-radar";
import {
  SIGNAL_CATEGORIES,
  type SignalCategory,
  type TrendDirection,
} from "@/modules/social-radar";

const categories: { id: SignalCategory | "all"; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "trending_topic", label: "Sujets tendance" },
  { id: "emerging_format", label: "Formats émergents" },
  { id: "rising_niche", label: "Niches en hausse" },
  { id: "trend_signal", label: "Signaux de tendance" },
  { id: "low_saturation", label: "Faible saturation" },
];

const directions: { id: TrendDirection | "all"; label: string }[] = [
  { id: "all", label: "Toutes directions" },
  { id: "rising", label: "En hausse" },
  { id: "stable", label: "Stable" },
  { id: "fading", label: "En baisse" },
];

const scoreRanges = [
  { id: "all", label: "Tous les scores" },
  { id: "high", label: "70+" },
  { id: "medium", label: "40-69" },
  { id: "low", label: "<40" },
];

export function SocialRadarUI() {
  const report = mockSocialRadarReport;
  const [category, setCategory] = useState<SignalCategory | "all">("all");
  const [direction, setDirection] = useState<TrendDirection | "all">("all");
  const [scoreRange, setScoreRange] = useState("all");

  const filtered = useMemo(() => {
    return report.signals.filter((s) => {
      if (category !== "all" && s.category !== category) return false;
      if (direction !== "all" && s.direction !== direction) return false;
      if (scoreRange === "high" && s.score < 70) return false;
      if (scoreRange === "medium" && (s.score < 40 || s.score >= 70)) return false;
      if (scoreRange === "low" && s.score >= 40) return false;
      return true;
    });
  }, [report.signals, category, direction, scoreRange]);

  return (
    <div>
      <SectionHeader
        title="Social Radar"
        description="Tendances émergentes, sujets en hausse et signaux sur lesquels agir avant tout le monde."
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{report.summary.totalSignals}</p>
          <p className="text-xs text-text-muted mt-1">Signaux détectés</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-success">{report.summary.risingCount}</p>
          <p className="text-xs text-text-muted mt-1">Signaux en hausse</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-accent">{report.summary.highScoreCount}</p>
          <p className="text-xs text-text-muted mt-1">Score élevé (70+)</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-base font-bold text-foreground">{SIGNAL_CATEGORIES[report.summary.topCategory].icon} {SIGNAL_CATEGORIES[report.summary.topCategory].label}</p>
          <p className="text-xs text-text-muted mt-1">Catégorie principale</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
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
        <div className="flex gap-2">
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as TrendDirection | "all")}
            className="rounded-lg bg-surface-2 border border-border px-3 py-1.5 text-xs text-text-secondary focus:outline-none focus:border-accent"
          >
            {directions.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
          <select
            value={scoreRange}
            onChange={(e) => setScoreRange(e.target.value)}
            className="rounded-lg bg-surface-2 border border-border px-3 py-1.5 text-xs text-text-secondary focus:outline-none focus:border-accent"
          >
            {scoreRanges.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Signal cards */}
      {filtered.length === 0 ? (
        <p className="text-sm text-text-muted py-8 text-center">Aucun signal ne correspond à vos filtres.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <RadarSignalCard key={s.id} signal={s} />
          ))}
        </div>
      )}
    </div>
  );
}
