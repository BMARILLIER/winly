"use client";

import type { SimulatorScores } from "@/modules/growth-simulator";
import { ProgressBar } from "./progress-bar";

function scoreColor(score: number) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-danger";
}

interface SimulatorScoreCardProps {
  scores: SimulatorScores;
  grade: string;
}

const scoreLabels: { key: keyof SimulatorScores; label: string; icon: string }[] = [
  { key: "growthPotential", label: "Growth Potential", icon: "🚀" },
  { key: "optimization", label: "Optimization", icon: "⚙️" },
  { key: "viralProbability", label: "Viral Probability", icon: "⚡" },
];

export function SimulatorScoreCard({ scores, grade }: SimulatorScoreCardProps) {
  return (
    <div className="space-y-5">
      {scoreLabels.map(({ key, label, icon }) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span>{icon}</span>
              <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
            <span className={`text-lg font-bold ${scoreColor(scores[key])}`}>
              {scores[key]}<span className="text-xs text-text-muted font-normal">/100</span>
            </span>
          </div>
          <ProgressBar value={scores[key]} gradient={scores[key] >= 50} />
        </div>
      ))}
      <div className="text-center pt-2">
        <span className="text-xs text-text-muted">Overall Grade</span>
        <p className={`text-3xl font-bold ${scoreColor(Math.round((scores.growthPotential + scores.optimization) / 2))}`}>
          {grade}
        </p>
      </div>
    </div>
  );
}
