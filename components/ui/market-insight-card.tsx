"use client";

import type { MarketInsight } from "@/modules/market-intelligence";
import { Badge } from "./badge";
import { Card } from "./card";

const categoryLabels: Record<string, string> = {
  format: "Format",
  pattern: "Pattern",
  audience: "Audience",
  timing: "Timing",
  benchmark: "Benchmark",
  strategy: "Strategy",
};

const categoryVariant: Record<string, "info" | "accent" | "success" | "warning" | "danger" | "default"> = {
  format: "accent",
  pattern: "info",
  audience: "success",
  timing: "warning",
  benchmark: "default",
  strategy: "danger",
};

interface MarketInsightCardProps {
  insight: MarketInsight;
}

export function MarketInsightCard({ insight }: MarketInsightCardProps) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={categoryVariant[insight.category] ?? "default"}>
              {categoryLabels[insight.category] ?? insight.category}
            </Badge>
            <span className="text-xs text-text-muted">{insight.confidence}% confidence</span>
            {insight.isActionable && (
              <Badge variant="success">actionable</Badge>
            )}
          </div>
          <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
        </div>
      </div>
    </Card>
  );
}
