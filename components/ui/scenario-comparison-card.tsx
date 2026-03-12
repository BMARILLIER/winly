"use client";

import type { ScenarioComparison } from "@/modules/growth-simulator";
import { Card } from "./card";

function deltaColor(d: number) {
  if (d > 0) return "text-success";
  if (d < 0) return "text-danger";
  return "text-text-muted";
}

function deltaPrefix(d: number) {
  if (d > 0) return "+";
  return "";
}

interface ScenarioComparisonCardProps {
  comparison: ScenarioComparison;
}

const metrics: { key: "growthPotential" | "optimization" | "viralProbability"; label: string }[] = [
  { key: "growthPotential", label: "Growth" },
  { key: "optimization", label: "Optimization" },
  { key: "viralProbability", label: "Viral" },
];

export function ScenarioComparisonCard({ comparison: c }: ScenarioComparisonCardProps) {
  return (
    <Card>
      <h4 className="text-sm font-semibold text-foreground mb-3">{c.label}</h4>
      <div className="space-y-2">
        {metrics.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">{label}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-muted">{c.baseline[key]}</span>
              <span className="text-xs text-text-muted">&rarr;</span>
              <span className="text-sm font-semibold text-foreground">{c.scenario[key]}</span>
              <span className={`text-xs font-medium ${deltaColor(c.delta[key])}`}>
                {deltaPrefix(c.delta[key])}{c.delta[key]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
