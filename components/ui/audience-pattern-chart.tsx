"use client";

import type { NichePostingWindows } from "@/modules/market-intelligence";

interface AudiencePatternChartProps {
  postingWindows: NichePostingWindows;
}

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

export function AudiencePatternChart({ postingWindows }: AudiencePatternChartProps) {
  const maxMultiplier = Math.max(...postingWindows.windows.map((w) => w.engagementMultiplier));

  return (
    <div className="space-y-3">
      {postingWindows.windows.map((w, i) => {
        const barWidth = (w.engagementMultiplier / maxMultiplier) * 100;
        const isBest = i === 0;

        return (
          <div key={`${w.day}-${w.hourStart}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isBest ? "text-accent" : "text-foreground"}`}>
                  {w.day} {formatHour(w.hourStart)}-{formatHour(w.hourEnd)}
                </span>
                {isBest && (
                  <span className="text-xs bg-accent/15 text-accent rounded-full px-2 py-0.5">Best</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted">{w.confidence}%</span>
                <span className={`text-sm font-semibold ${isBest ? "text-accent" : "text-text-secondary"}`}>
                  +{Math.round((w.engagementMultiplier - 1) * 100)}%
                </span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isBest
                    ? "bg-gradient-to-r from-primary via-violet to-cyan"
                    : "bg-accent/60"
                }`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
