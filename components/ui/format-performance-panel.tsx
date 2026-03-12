"use client";

import type { NicheFormatRanking } from "@/modules/market-intelligence";
import { formatLabel } from "@/types";
import { ProgressBar } from "./progress-bar";

interface FormatPerformancePanelProps {
  ranking: NicheFormatRanking;
  userTopFormat?: string;
}

export function FormatPerformancePanel({ ranking, userTopFormat }: FormatPerformancePanelProps) {
  const maxEngagement = Math.max(...ranking.rankings.map((r) => r.avgEngagementRate));

  return (
    <div className="space-y-4">
      {ranking.rankings.map((r) => {
        const pct = maxEngagement > 0 ? (r.avgEngagementRate / maxEngagement) * 100 : 0;
        const isUser = r.format === userTopFormat;

        return (
          <div key={r.format}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isUser ? "text-accent" : "text-foreground"}`}>
                  {formatLabel(r.format)}
                </span>
                {isUser && (
                  <span className="text-xs bg-accent/15 text-accent rounded-full px-2 py-0.5">Your top</span>
                )}
              </div>
              <span className="text-sm font-semibold text-text-secondary">
                {(r.avgEngagementRate * 100).toFixed(1)}%
              </span>
            </div>
            <ProgressBar value={pct} gradient={isUser} />
          </div>
        );
      })}
    </div>
  );
}
