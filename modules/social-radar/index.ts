/**
 * Social Radar — Orchestrator Module
 *
 * Combines existing engines into a unified signal feed:
 *   - modules/trend-radar     → Trending Topics + Rising Niches
 *   - modules/radar           → Low Saturation Opportunities
 *   - modules/market-intelligence → Emerging Formats + Posting Windows
 *   - modules/opportunity-detector → Signal scoring factors
 *
 * No duplicated scoring logic. This module only composes and normalizes.
 */

import { analyzeTrends, type TrendResult, type TrendRadarInput } from "@/modules/trend-radar";
import type { NicheFormatRanking, NichePostingWindows } from "@/modules/market-intelligence";
import { formatLabel, type ContentFormat } from "@/types";

// ─── Types ───

export type SignalCategory =
  | "trending_topic"
  | "emerging_format"
  | "rising_niche"
  | "trend_signal"
  | "low_saturation";

export type { TrendDirection } from "@/types";
import type { TrendDirection } from "@/types";

export interface RadarSignal {
  id: string;
  category: SignalCategory;
  title: string;
  score: number;              // 0-100
  direction: TrendDirection;
  confidence: number;         // 0-100
  tags: string[];
  recommendedFormat: string;
  recommendedAction: string;
}

export interface SocialRadarInput {
  trendInput: TrendRadarInput;
  nicheFormatRankings: NicheFormatRanking[];
  nichePostingWindows: NichePostingWindows[];
  userTopFormat?: ContentFormat;
}

export interface SocialRadarReport {
  signals: RadarSignal[];
  summary: {
    totalSignals: number;
    risingCount: number;
    highScoreCount: number;
    topCategory: SignalCategory;
  };
}

// ─── Direction from momentum ───

export function momentumToDirection(momentum: number): TrendDirection {
  if (momentum >= 30) return "rising";
  if (momentum >= -10) return "stable";
  return "fading";
}

// ─── Confidence from trend score ───

function scoreToConfidence(score: number): number {
  // Higher scores = higher confidence in the signal
  return Math.min(99, Math.max(20, Math.round(score * 0.85 + 15)));
}

// ─── Convert TrendResults to RadarSignals ───

function trendToSignals(trends: TrendResult[]): RadarSignal[] {
  return trends.map((t, i) => ({
    id: `sig_trend_${i}`,
    category: categorizeTrend(t),
    title: t.topic,
    score: t.trendScore,
    direction: momentumToDirection(t.momentum),
    confidence: scoreToConfidence(t.trendScore),
    tags: t.hashtags.slice(0, 3),
    recommendedFormat: t.format,
    recommendedAction: t.suggestedContent[0] ?? `Créez du contenu sur « ${t.topic} »`,
  }));
}

function categorizeTrend(t: TrendResult): SignalCategory {
  if (t.category === "hashtag" || t.category === "topic") return "trending_topic";
  if (t.category === "format") return "emerging_format";
  return "trend_signal";
}

// ─── Convert Format Rankings to Emerging Format Signals ───

function formatToSignals(
  rankings: NicheFormatRanking[],
  niche: string,
  platform: string,
  userTopFormat?: ContentFormat
): RadarSignal[] {
  const ranking = rankings.find((r) => r.niche === niche && r.platform === platform);
  if (!ranking) return [];

  const signals: RadarSignal[] = [];

  // Find formats that outperform the user's top format
  const userPerf = ranking.rankings.find((r) => r.format === userTopFormat);
  const userRate = userPerf?.avgEngagementRate ?? 0;

  ranking.rankings.forEach((r, i) => {
    if (r.format === userTopFormat) return; // skip user's current format
    if (r.avgEngagementRate <= userRate * 0.9) return; // skip if not meaningfully better

    const outperformPct = userRate > 0
      ? Math.round(((r.avgEngagementRate - userRate) / userRate) * 100)
      : 0;

    signals.push({
      id: `sig_fmt_${i}`,
      category: "emerging_format",
      title: `${formatLabel(r.format)} surpasse de ${outperformPct}%`,
      score: Math.min(100, Math.round(r.avgEngagementRate * 1500)),
      direction: outperformPct > 15 ? "rising" : "stable",
      confidence: Math.min(95, 50 + Math.round(r.sampleSize / 100)),
      tags: [formatLabel(r.format), `${(r.avgEngagementRate * 100).toFixed(1)}% eng.`],
      recommendedFormat: r.format,
      recommendedAction: `Testez plus de contenu ${formatLabel(r.format).toLowerCase()} — ${(r.avgEngagementRate * 100).toFixed(1)}% d'engagement moyen dans votre niche.`,
    });
  });

  return signals.slice(0, 3);
}

// ─── Convert Posting Windows to Timing Signals ───

function timingToSignals(
  windows: NichePostingWindows[],
  niche: string,
  platform: string
): RadarSignal[] {
  const data = windows.find((w) => w.niche === niche && w.platform === platform);
  if (!data) return [];

  const best = data.bestWindow;

  function fmtHour(h: number): string {
    if (h < 12) return `${h} AM`;
    if (h === 12) return `12 PM`;
    return `${h - 12} PM`;
  }

  return [{
    id: "sig_timing_best",
    category: "trend_signal",
    title: `Peak window: ${best.day} ${fmtHour(best.hourStart)}-${fmtHour(best.hourEnd)}`,
    score: Math.round(best.engagementMultiplier * 60),
    direction: "stable",
    confidence: best.confidence,
    tags: [best.day, `+${Math.round((best.engagementMultiplier - 1) * 100)}% engagement`],
    recommendedFormat: "any",
    recommendedAction: `Planifiez votre prochaine publication pour ${best.day} entre ${fmtHour(best.hourStart)} et ${fmtHour(best.hourEnd)}.`,
  }];
}

// ─── Low Saturation Signals from niche gap analysis ───

function lowSaturationSignals(
  rankings: NicheFormatRanking[],
  niche: string,
  platform: string
): RadarSignal[] {
  const ranking = rankings.find((r) => r.niche === niche && r.platform === platform);
  if (!ranking) return [];

  // Find formats with high save rates but lower engagement (= undervalued)
  const sorted = [...ranking.rankings].sort((a, b) => {
    const aRatio = a.avgSaveRate / (a.avgEngagementRate || 1);
    const bRatio = b.avgSaveRate / (b.avgEngagementRate || 1);
    return bRatio - aRatio;
  });

  const top = sorted[0];
  if (!top) return [];

  const saveToEng = top.avgEngagementRate > 0
    ? (top.avgSaveRate / top.avgEngagementRate * 100).toFixed(0)
    : "0";

  return [{
    id: "sig_lowsat_0",
    category: "low_saturation",
    title: `${formatLabel(top.format)} a un ratio sauvegarde/engagement de ${saveToEng}%`,
    score: Math.min(100, Math.round(top.avgSaveRate * 2500)),
    direction: "rising",
    confidence: Math.min(90, 40 + Math.round(top.sampleSize / 80)),
    tags: [formatLabel(top.format), `${(top.avgSaveRate * 100).toFixed(1)}% saves`],
    recommendedFormat: top.format,
    recommendedAction: `Un taux de sauvegarde élevé indique une forte valeur. Créez plus de contenu ${formatLabel(top.format).toLowerCase()} qui incite à sauvegarder.`,
  }];
}

// ─── Rising Niche Signals ───

function risingNicheSignals(trends: TrendResult[]): RadarSignal[] {
  // Detect rising topics that could represent niche expansion opportunities
  const rising = trends
    .filter((t) => t.momentum >= 50 && t.trendScore >= 60)
    .slice(0, 2);

  return rising.map((t, i) => ({
    id: `sig_niche_${i}`,
    category: "rising_niche" as SignalCategory,
    title: `« ${t.topic} » gagne en élan rapidement`,
    score: t.trendScore,
    direction: "rising" as TrendDirection,
    confidence: scoreToConfidence(t.trendScore),
    tags: [...t.hashtags.slice(0, 2), t.format],
    recommendedFormat: t.format,
    recommendedAction: `Ce sujet est en plein essor. Publiez ${t.suggestedContent[0] ?? `du contenu sur « ${t.topic} »`} dans les 48 heures.`,
  }));
}

// ─── Main Export ───

export function computeSocialRadar(input: SocialRadarInput): SocialRadarReport {
  const trends = analyzeTrends(input.trendInput);

  const allSignals: RadarSignal[] = [
    ...trendToSignals(trends.slice(0, 8)),
    ...formatToSignals(input.nicheFormatRankings, input.trendInput.niche, input.trendInput.platform, input.userTopFormat),
    ...timingToSignals(input.nichePostingWindows, input.trendInput.niche, input.trendInput.platform),
    ...lowSaturationSignals(input.nicheFormatRankings, input.trendInput.niche, input.trendInput.platform),
    ...risingNicheSignals(trends),
  ];

  // Deduplicate by title similarity
  const seen = new Set<string>();
  const deduped = allSignals.filter((s) => {
    const key = s.title.toLowerCase().slice(0, 30);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by score descending
  deduped.sort((a, b) => b.score - a.score);

  const risingCount = deduped.filter((s) => s.direction === "rising").length;
  const highScoreCount = deduped.filter((s) => s.score >= 70).length;

  // Find most common category
  const catCounts: Record<string, number> = {};
  deduped.forEach((s) => { catCounts[s.category] = (catCounts[s.category] ?? 0) + 1; });
  const topCategory = (Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "trending_topic") as SignalCategory;

  return {
    signals: deduped,
    summary: {
      totalSignals: deduped.length,
      risingCount,
      highScoreCount,
      topCategory,
    },
  };
}

// ─── Category Labels for UI ───

export const SIGNAL_CATEGORIES: Record<SignalCategory, { label: string; icon: string }> = {
  trending_topic: { label: "Sujet tendance", icon: "📈" },
  emerging_format: { label: "Format émergent", icon: "🎨" },
  rising_niche: { label: "Niche en croissance", icon: "🚀" },
  trend_signal: { label: "Signal de tendance", icon: "📡" },
  low_saturation: { label: "Faible saturation", icon: "💎" },
};
