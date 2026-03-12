// Market Intelligence — pure computation, no external dependencies
//
// Shared types (Niche, ContentFormat, Platform, AudienceTier) are defined in @/types.
// Re-exported here for backwards compatibility.

export type { Niche, ContentFormat, AudienceTier, Platform } from "@/types";
import type { Niche, ContentFormat, AudienceTier, Platform } from "@/types";
import { formatLabel as _formatLabel } from "@/types";

// Local alias for internal use (re-exported at bottom for backwards compat)
const formatLabel = _formatLabel;

export interface FormatPerformance {
  format: ContentFormat;
  avgEngagementRate: number;   // e.g. 0.048
  avgReach: number;
  avgSaveRate: number;
  avgShareRate: number;
  sampleSize: number;
}

export interface NicheFormatRanking {
  niche: Niche;
  platform: Platform;
  rankings: FormatPerformance[];
}

export interface ContentPattern {
  id: string;
  niche: Niche;
  pattern: string;           // human-readable description
  confidence: number;        // 0-100
  impactLevel: "high" | "medium" | "low";
  audienceTier: AudienceTier;
  relatedFormats: ContentFormat[];
}

export interface AudienceBehavior {
  id: string;
  niche: Niche;
  audienceTier: AudienceTier;
  insight: string;
  metric: string;
  value: number;
  benchmark: number;
  direction: "above" | "below" | "at";
}

export interface PostingWindow {
  day: string;
  hourStart: number;
  hourEnd: number;
  engagementMultiplier: number; // 1.0 = average, 1.3 = 30% above
  confidence: number;           // 0-100
}

export interface NichePostingWindows {
  niche: Niche;
  platform: Platform;
  windows: PostingWindow[];
  bestWindow: PostingWindow;
}

export interface GrowthBenchmark {
  niche: Niche;
  audienceTier: AudienceTier;
  platform: Platform;
  metrics: {
    engagementRate: { p25: number; p50: number; p75: number; p90: number };
    saveRate: { p25: number; p50: number; p75: number; p90: number };
    shareRate: { p25: number; p50: number; p75: number; p90: number };
    followerGrowthMonthly: { p25: number; p50: number; p75: number; p90: number };
    postsPerWeek: { p25: number; p50: number; p75: number; p90: number };
  };
}

export interface WinningStrategy {
  id: string;
  niche: Niche;
  title: string;
  description: string;
  evidenceStrength: "strong" | "moderate" | "emerging";
  appliesTo: AudienceTier[];
  recommendedFormats: ContentFormat[];
  expectedImpact: string;
}

export interface MarketInsight {
  id: string;
  category: "format" | "pattern" | "audience" | "timing" | "benchmark" | "strategy";
  niche: Niche;
  text: string;
  confidence: number;
  isActionable: boolean;
}

// ─── User vs Market Benchmark ───

export interface UserMetrics {
  engagementRate: number;
  saveRate: number;
  shareRate: number;
  followerGrowthMonthly: number;
  postsPerWeek: number;
  topFormat: ContentFormat;
  niche: Niche;
  audienceTier: AudienceTier;
  platform: Platform;
  consistency: number; // 0-100
}

export interface BenchmarkComparison {
  metric: string;
  label: string;
  userValue: number;
  benchmarkP50: number;
  benchmarkP75: number;
  percentile: number;         // estimated user percentile
  verdict: "above" | "below" | "at";
  insight: string;
}

export interface MarketIntelligenceReport {
  comparisons: BenchmarkComparison[];
  formatMatch: {
    userTopFormat: ContentFormat;
    marketTopFormat: ContentFormat;
    isAligned: boolean;
    suggestion: string;
  };
  topInsights: MarketInsight[];
}

// ─── Benchmark Comparison Logic ───

function estimatePercentile(
  value: number,
  p25: number,
  p50: number,
  p75: number,
  p90: number
): number {
  if (value <= p25) return Math.round((value / p25) * 25);
  if (value <= p50) return 25 + Math.round(((value - p25) / (p50 - p25)) * 25);
  if (value <= p75) return 50 + Math.round(((value - p50) / (p75 - p50)) * 25);
  if (value <= p90) return 75 + Math.round(((value - p75) / (p90 - p75)) * 15);
  return Math.min(99, 90 + Math.round(((value - p90) / (p90 * 0.5)) * 9));
}

function getVerdict(percentile: number): "above" | "below" | "at" {
  if (percentile >= 60) return "above";
  if (percentile <= 40) return "below";
  return "at";
}

function buildComparison(
  metric: string,
  label: string,
  userValue: number,
  quartiles: { p25: number; p50: number; p75: number; p90: number },
  unit: string
): BenchmarkComparison {
  const percentile = estimatePercentile(
    userValue,
    quartiles.p25,
    quartiles.p50,
    quartiles.p75,
    quartiles.p90
  );
  const verdict = getVerdict(percentile);
  const pctDiff = quartiles.p50 > 0
    ? Math.round(((userValue - quartiles.p50) / quartiles.p50) * 100)
    : 0;

  let insight: string;
  if (verdict === "above") {
    insight = `Vous êtes au-dessus de la moyenne en ${label.toLowerCase()} (top ${100 - percentile} % des créateurs de votre niche).`;
  } else if (verdict === "below") {
    insight = `Vous êtes en dessous du benchmark en ${label.toLowerCase()} — ${Math.abs(pctDiff)} % sous la médiane${unit ? ` (${quartiles.p50}${unit})` : ""}.`;
  } else {
    insight = `Votre ${label.toLowerCase()} est pile dans la moyenne du marché.`;
  }

  return { metric, label, userValue, benchmarkP50: quartiles.p50, benchmarkP75: quartiles.p75, percentile, verdict, insight };
}

// ─── Main Exports ───

export function computeBenchmarkComparisons(
  user: UserMetrics,
  benchmark: GrowthBenchmark
): BenchmarkComparison[] {
  return [
    buildComparison("engagementRate", "Taux d'engagement", user.engagementRate, benchmark.metrics.engagementRate, "%"),
    buildComparison("saveRate", "Taux de sauvegarde", user.saveRate, benchmark.metrics.saveRate, "%"),
    buildComparison("shareRate", "Taux de partage", user.shareRate, benchmark.metrics.shareRate, "%"),
    buildComparison("followerGrowthMonthly", "Croissance mensuelle d'abonnés", user.followerGrowthMonthly, benchmark.metrics.followerGrowthMonthly, "%"),
    buildComparison("postsPerWeek", "Posts par semaine", user.postsPerWeek, benchmark.metrics.postsPerWeek, ""),
  ];
}

export function computeFormatMatch(
  userTopFormat: ContentFormat,
  nicheRanking: NicheFormatRanking
): MarketIntelligenceReport["formatMatch"] {
  const marketTop = nicheRanking.rankings[0];
  const isAligned = userTopFormat === marketTop?.format;
  const suggestion = isAligned
    ? `Votre format principal (${formatLabel(userTopFormat)}) correspond au format le plus fort du marché. Continuez.`
    : `Votre format principal (${formatLabel(userTopFormat)}) ne correspond pas au format le plus fort du marché (${formatLabel(marketTop?.format ?? "carousel")}). Envisagez de tester plus de ${formatLabel(marketTop?.format ?? "carousel").toLowerCase()}.`;

  return {
    userTopFormat,
    marketTopFormat: marketTop?.format ?? "carousel",
    isAligned,
    suggestion,
  };
}

export function computeMarketIntelligence(
  user: UserMetrics,
  benchmark: GrowthBenchmark,
  nicheRanking: NicheFormatRanking,
  insights: MarketInsight[]
): MarketIntelligenceReport {
  const comparisons = computeBenchmarkComparisons(user, benchmark);
  const formatMatch = computeFormatMatch(user.topFormat, nicheRanking);
  const topInsights = insights
    .filter((i) => i.niche === user.niche)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);

  return { comparisons, formatMatch, topInsights };
}

// ─── Helpers (re-exported from @/types for backwards compatibility) ───

export { formatLabel, nicheLabel, tierLabel } from "@/types";
