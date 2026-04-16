"use client";

import { Clock, Zap } from "lucide-react";
import type { BestTimeResult } from "@/lib/queries/best-time-to-post";

interface Props {
  data: BestTimeResult;
}

const DAY_LABELS = ["D", "L", "M", "M", "J", "V", "S"];

function formatCountdown(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h < 24) return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}j ${h % 24}h`;
}

export function BestTimeCard({ data }: Props) {
  if (!data.hasData) {
    return (
      <div className="rounded-xl border border-border bg-surface-1 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-5 w-5 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Meilleur moment pour poster</h3>
        </div>
        <p className="text-xs text-text-muted">
          Synchronise Instagram et publie quelques posts pour debloquer cette analyse.
        </p>
      </div>
    );
  }

  const maxEng = Math.max(...data.heatmap.flat(), 1);

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Meilleur moment pour poster</h3>
        </div>
      </div>

      {/* Next best time — prominent */}
      {data.nextBestTime && (
        <div className="mb-4 rounded-lg bg-accent/10 border border-accent/20 p-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {data.nextBestTime.label}
            </p>
            <p className="text-xs text-accent">
              dans {formatCountdown(data.nextBestTime.inMinutes)}
            </p>
          </div>
        </div>
      )}

      {/* Top 5 slots */}
      <div className="space-y-1.5 mb-4">
        {data.topSlots.map((slot, i) => (
          <div key={`${slot.dayOfWeek}-${slot.hour}`} className="flex items-center gap-2 text-xs">
            <span className={`w-4 text-center font-bold ${i === 0 ? "text-accent" : "text-text-muted"}`}>
              {i + 1}
            </span>
            <span className="w-8 font-medium text-foreground">{slot.dayLabel}</span>
            <span className="w-8 text-text-secondary">{slot.hourLabel}</span>
            <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
              <div
                className={`h-full rounded-full ${i === 0 ? "bg-accent" : "bg-accent/50"}`}
                style={{ width: `${(slot.avgEngagement / (data.topSlots[0]?.avgEngagement || 1)) * 100}%` }}
              />
            </div>
            <span className="w-12 text-right text-text-muted">
              {slot.avgEngagement} eng
            </span>
          </div>
        ))}
      </div>

      {/* Mini heatmap */}
      <div>
        <p className="text-[10px] text-text-muted mb-1.5 uppercase tracking-wider">Heatmap engagement</p>
        <div className="flex gap-0.5">
          {data.heatmap.map((dayData, dayIdx) => (
            <div key={dayIdx} className="flex-1 space-y-0.5">
              <div className="text-[8px] text-text-muted text-center">{DAY_LABELS[dayIdx]}</div>
              {[6, 9, 12, 15, 18, 21].map((h) => {
                const val = dayData[h] ?? 0;
                const intensity = maxEng > 0 ? val / maxEng : 0;
                return (
                  <div
                    key={h}
                    className="h-2.5 rounded-[2px]"
                    style={{
                      backgroundColor:
                        intensity > 0.7
                          ? "rgb(124, 58, 237)"
                          : intensity > 0.4
                            ? "rgba(124, 58, 237, 0.5)"
                            : intensity > 0.1
                              ? "rgba(124, 58, 237, 0.2)"
                              : "var(--surface-3)",
                    }}
                    title={`${DAY_LABELS[dayIdx]} ${h}h: ${val} eng`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[8px] text-text-muted">
          <span>6h</span>
          <span>12h</span>
          <span>18h</span>
          <span>21h</span>
        </div>
      </div>
    </div>
  );
}
