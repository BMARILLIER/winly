"use client";

import type { NicheFormatRanking } from "@/modules/market-intelligence";
import { formatLabel } from "@/types";

interface NicheComparisonTableProps {
  rankings: NicheFormatRanking[];
  selectedNiche: string;
}

export function NicheComparisonTable({ rankings, selectedNiche }: NicheComparisonTableProps) {
  const ranking = rankings.find((r) => r.niche === selectedNiche) ?? rankings[0];
  if (!ranking) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-3 text-xs font-medium text-text-muted uppercase tracking-wide">Format</th>
            <th className="text-right py-3 px-3 text-xs font-medium text-text-muted uppercase tracking-wide">Engagement</th>
            <th className="text-right py-3 px-3 text-xs font-medium text-text-muted uppercase tracking-wide">Avg Reach</th>
            <th className="text-right py-3 px-3 text-xs font-medium text-text-muted uppercase tracking-wide">Save Rate</th>
            <th className="text-right py-3 px-3 text-xs font-medium text-text-muted uppercase tracking-wide">Share Rate</th>
            <th className="text-right py-3 px-3 text-xs font-medium text-text-muted uppercase tracking-wide">Sample</th>
          </tr>
        </thead>
        <tbody>
          {ranking.rankings.map((r, i) => (
            <tr
              key={r.format}
              className={`border-b border-border/50 ${i === 0 ? "bg-accent/5" : ""} hover:bg-surface-2 transition-colors`}
            >
              <td className="py-3 px-3 font-medium text-foreground">
                {i === 0 && <span className="text-accent mr-1.5">1</span>}
                {formatLabel(r.format)}
              </td>
              <td className="py-3 px-3 text-right text-text-secondary">{(r.avgEngagementRate * 100).toFixed(1)}%</td>
              <td className="py-3 px-3 text-right text-text-secondary">{(r.avgReach / 1000).toFixed(1)}K</td>
              <td className="py-3 px-3 text-right text-text-secondary">{(r.avgSaveRate * 100).toFixed(1)}%</td>
              <td className="py-3 px-3 text-right text-text-secondary">{(r.avgShareRate * 100).toFixed(1)}%</td>
              <td className="py-3 px-3 text-right text-text-muted">{r.sampleSize.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
