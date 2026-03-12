"use client";

import Link from "next/link";
import type { SocialRadarReport } from "@/modules/social-radar";
import { SIGNAL_CATEGORIES } from "@/modules/social-radar";
import { Card } from "./card";
import { Badge } from "./badge";
import { TrendDirectionBadge } from "./trend-direction-badge";

interface RadarSummaryPanelProps {
  report: SocialRadarReport;
}

export function RadarSummaryPanel({ report }: RadarSummaryPanelProps) {
  const topSignals = report.signals.slice(0, 3);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-text-secondary">Social Radar</h2>
        <Link
          href="/dashboard/radar"
          className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
        >
          View all &rarr;
        </Link>
      </div>

      {/* Summary stats */}
      <div className="flex gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{report.summary.totalSignals}</p>
          <p className="text-xs text-text-muted">Signals</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-success">{report.summary.risingCount}</p>
          <p className="text-xs text-text-muted">Rising</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">{report.summary.highScoreCount}</p>
          <p className="text-xs text-text-muted">High score</p>
        </div>
      </div>

      {/* Top signals */}
      <div className="space-y-3">
        {topSignals.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-lg bg-surface-2 p-3">
            <span className="text-base">{SIGNAL_CATEGORIES[s.category].icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
              <p className="text-xs text-text-secondary mt-0.5 truncate">{s.recommendedAction}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-foreground">{s.score}</span>
              <TrendDirectionBadge direction={s.direction} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
