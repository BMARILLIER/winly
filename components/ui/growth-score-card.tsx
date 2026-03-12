"use client";

import { Badge } from "./badge";

interface GrowthScoreCardProps {
  score: number;
  grade: string;
  label: "High" | "Medium" | "Low";
}

const labelVariant = {
  High: "success",
  Medium: "warning",
  Low: "danger",
} as const;

function scoreColor(score: number) {
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

export function GrowthScoreCard({ score, grade, label }: GrowthScoreCardProps) {
  const color = scoreColor(score);
  const circumference = 2 * Math.PI * 62;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-36 w-36">
        <svg className="h-36 w-36 -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="62" fill="none" stroke="var(--surface-3)" strokeWidth="10" />
          <circle
            cx="70"
            cy="70"
            r="62"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-foreground">{score}</span>
          <span className="text-sm font-semibold text-text-secondary">{grade}</span>
        </div>
      </div>
      <Badge variant={labelVariant[label]}>{label} Growth Potential</Badge>
    </div>
  );
}
