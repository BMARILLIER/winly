/**
 * Growth Simulator — Standalone scoring module
 *
 * Simulates growth potential based on user inputs.
 * Does NOT import from growth-engine or analytics modules.
 * Reuses shared types from @/types. GrowthBenchmark from market-intelligence.
 */

import type { Niche, ContentFormat, Platform } from "@/types";
import type { GrowthBenchmark } from "@/modules/market-intelligence";

// ─── Types ───

export interface SimulatorInput {
  followerCount: number;
  postsPerWeek: number;
  niche: Niche;
  mainFormat: ContentFormat;
  platform: Platform;
  engagementRate: number; // e.g. 0.042 = 4.2%
}

export interface SimulatorScores {
  growthPotential: number;    // 0-100
  optimization: number;       // 0-100
  viralProbability: number;   // 0-100
}

export interface SimulatorRecommendation {
  id: string;
  title: string;
  impact: "high" | "medium" | "low";
}

export interface BenchmarkSummaryItem {
  metric: string;
  label: string;
  userValue: string;
  benchmarkValue: string;
  verdict: "above" | "below" | "at";
}

export interface SimulatorResult {
  scores: SimulatorScores;
  grade: string;
  recommendations: SimulatorRecommendation[];
  benchmarkSummary: BenchmarkSummaryItem[];
}

export interface ScenarioComparison {
  label: string;
  baseline: SimulatorScores;
  scenario: SimulatorScores;
  delta: {
    growthPotential: number;
    optimization: number;
    viralProbability: number;
  };
}

// ─── Scoring Formulas ───

// Optimal posting frequency by niche (posts/week)
const NICHE_OPTIMAL_FREQ: Record<Niche, number> = {
  fitness: 5, lifestyle: 5, travel: 3.5, tech: 4,
  entrepreneurship: 4, finance: 4, marketing: 4, wellness: 4,
};

// Format strength by platform (0-1)
const FORMAT_PLATFORM_FIT: Record<Platform, Partial<Record<ContentFormat, number>>> = {
  instagram: { reel: 0.95, carousel: 0.90, static_image: 0.55, story: 0.60, video: 0.75 },
  tiktok: { reel: 0.98, video: 0.85, story: 0.50, carousel: 0.30 },
  twitter: { thread: 0.92, static_image: 0.60, carousel: 0.55, video: 0.50 },
  linkedin: { carousel: 0.90, thread: 0.85, video: 0.70, static_image: 0.55 },
  youtube: { video: 0.95, reel: 0.80, live: 0.70 },
};

// Engagement benchmarks by follower tier
function getEngagementBenchmark(followers: number): number {
  if (followers < 5000) return 0.06;
  if (followers < 25000) return 0.04;
  if (followers < 100000) return 0.03;
  if (followers < 500000) return 0.022;
  return 0.015;
}

function scoreGrowthPotential(input: SimulatorInput): number {
  // Frequency score (0-35): how close to niche optimal
  const optimal = NICHE_OPTIMAL_FREQ[input.niche] ?? 4;
  const freqRatio = Math.min(1.2, input.postsPerWeek / optimal);
  const freqScore = Math.round(freqRatio * 29);

  // Engagement score (0-35): engagement vs benchmark for follower tier
  const benchmark = getEngagementBenchmark(input.followerCount);
  const engRatio = benchmark > 0 ? input.engagementRate / benchmark : 0;
  const engScore = Math.round(Math.min(35, Math.max(0, (engRatio - 0.3) / 1.2 * 35)));

  // Format-platform fit (0-20)
  const fit = FORMAT_PLATFORM_FIT[input.platform]?.[input.mainFormat] ?? 0.5;
  const formatScore = Math.round(fit * 20);

  // Size momentum bonus (0-10): smaller accounts grow faster
  let sizeBonus = 0;
  if (input.followerCount < 5000) sizeBonus = 10;
  else if (input.followerCount < 25000) sizeBonus = 7;
  else if (input.followerCount < 100000) sizeBonus = 4;
  else sizeBonus = 2;

  return Math.min(100, Math.max(0, freqScore + engScore + formatScore + sizeBonus));
}

function scoreOptimization(input: SimulatorInput): number {
  // How well is the creator positioned for growth?

  // Format match (0-30)
  const fit = FORMAT_PLATFORM_FIT[input.platform]?.[input.mainFormat] ?? 0.5;
  const formatOpt = Math.round(fit * 30);

  // Frequency optimization (0-30)
  const optimal = NICHE_OPTIMAL_FREQ[input.niche] ?? 4;
  const freqDelta = Math.abs(input.postsPerWeek - optimal);
  const freqOpt = Math.round(Math.max(0, 30 - freqDelta * 6));

  // Engagement quality (0-25)
  const benchmark = getEngagementBenchmark(input.followerCount);
  const engRatio = benchmark > 0 ? input.engagementRate / benchmark : 0;
  const engOpt = Math.round(Math.min(25, engRatio * 18));

  // Consistency proxy from frequency (0-15)
  const consistencyOpt = input.postsPerWeek >= 2 ? Math.min(15, Math.round(input.postsPerWeek * 3)) : 5;

  return Math.min(100, Math.max(0, formatOpt + freqOpt + engOpt + consistencyOpt));
}

function scoreViralProbability(input: SimulatorInput): number {
  // Viral probability is intentionally lower — hard to go viral

  // Engagement spike potential (0-30)
  const benchmark = getEngagementBenchmark(input.followerCount);
  const engMultiple = benchmark > 0 ? input.engagementRate / benchmark : 0;
  const engViral = Math.round(Math.min(30, Math.max(0, (engMultiple - 0.8) * 30)));

  // Format virality (0-25): reels/video have higher viral ceiling
  const viralFormats: Partial<Record<ContentFormat, number>> = {
    reel: 25, video: 20, carousel: 15, thread: 12, static_image: 8, story: 5, live: 10,
  };
  const formatViral = viralFormats[input.mainFormat] ?? 10;

  // Platform virality ceiling (0-20)
  const platformViral: Record<Platform, number> = {
    tiktok: 20, instagram: 16, youtube: 14, twitter: 12, linkedin: 8,
  };
  const platViral = platformViral[input.platform] ?? 12;

  // Volume boost (0-15): more posts = more lottery tickets
  const volumeViral = Math.min(15, Math.round(input.postsPerWeek * 2.5));

  // Niche virality (0-10)
  const nicheViral: Partial<Record<Niche, number>> = {
    fitness: 9, lifestyle: 8, travel: 8, tech: 7, entrepreneurship: 6, finance: 5, marketing: 5, wellness: 6,
  };
  const nicheV = nicheViral[input.niche] ?? 6;

  return Math.min(100, Math.max(0, engViral + formatViral + platViral + volumeViral + nicheV));
}

// ─── Grade ───

function getGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

// ─── Recommendations ───

function generateRecommendations(input: SimulatorInput, scores: SimulatorScores): SimulatorRecommendation[] {
  const recs: SimulatorRecommendation[] = [];
  const optimal = NICHE_OPTIMAL_FREQ[input.niche] ?? 4;

  // Frequency recommendation
  if (input.postsPerWeek < optimal * 0.7) {
    recs.push({
      id: "rec_freq",
      title: `Augmentez la publication à ${Math.ceil(optimal)}x par semaine (actuellement ${input.postsPerWeek}x)`,
      impact: input.postsPerWeek < optimal * 0.5 ? "high" : "medium",
    });
  }

  // Recommandation de format
  const fit = FORMAT_PLATFORM_FIT[input.platform]?.[input.mainFormat] ?? 0.5;
  if (fit < 0.75) {
    const best = Object.entries(FORMAT_PLATFORM_FIT[input.platform] ?? {})
      .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0];
    if (best) {
      recs.push({
        id: "rec_format",
        title: `Passez au format principal ${best[0].replace("_", " ")} pour de meilleures performances sur ${input.platform}`,
        impact: "high",
      });
    }
  }

  // Recommandation d'engagement
  const benchmark = getEngagementBenchmark(input.followerCount);
  if (input.engagementRate < benchmark * 0.8) {
    recs.push({
      id: "rec_engagement",
      title: "Boostez l'engagement avec des hooks plus forts et des CTAs clairs dans chaque post",
      impact: "high",
    });
  }

  // Recommandation de timing
  if (scores.viralProbability < 40) {
    recs.push({
      id: "rec_timing",
      title: "Publiez aux heures de pointe de votre audience pour maximiser les signaux d'engagement initiaux",
      impact: "medium",
    });
  }

  // Recommandation de régularité
  if (input.postsPerWeek < 2) {
    recs.push({
      id: "rec_consistency",
      title: "Publier moins de 2x/semaine limite significativement la distribution algorithmique",
      impact: "high",
    });
  }

  // Diversité de format
  if (fit > 0.85 && scores.optimization > 60) {
    recs.push({
      id: "rec_diversity",
      title: "Bonne adéquation du format — envisagez de tester un format secondaire pour diversifier la portée",
      impact: "low",
    });
  }

  return recs.slice(0, 3);
}

// ─── Benchmark Summary ───

function buildBenchmarkSummary(input: SimulatorInput, benchmark?: GrowthBenchmark): BenchmarkSummaryItem[] {
  const engBenchmark = getEngagementBenchmark(input.followerCount);
  const optimal = NICHE_OPTIMAL_FREQ[input.niche] ?? 4;

  const items: BenchmarkSummaryItem[] = [
    {
      metric: "engagementRate",
      label: "Taux d'engagement",
      userValue: `${(input.engagementRate * 100).toFixed(1)}%`,
      benchmarkValue: `${(engBenchmark * 100).toFixed(1)}%`,
      verdict: input.engagementRate >= engBenchmark * 1.1 ? "above" : input.engagementRate >= engBenchmark * 0.9 ? "at" : "below",
    },
    {
      metric: "postsPerWeek",
      label: "Fréquence de publication",
      userValue: `${input.postsPerWeek}x/semaine`,
      benchmarkValue: `${optimal}x/semaine`,
      verdict: input.postsPerWeek >= optimal * 0.9 ? "above" : input.postsPerWeek >= optimal * 0.6 ? "at" : "below",
    },
  ];

  // Utiliser le benchmark marché si disponible
  if (benchmark) {
    items.push({
      metric: "followerGrowth",
      label: "Croissance mensuelle attendue",
      userValue: "—",
      benchmarkValue: `${(benchmark.metrics.followerGrowthMonthly.p50 * 100).toFixed(1)}%`,
      verdict: "at",
    });
  }

  return items;
}

// ─── Main Export ───

export function simulateGrowth(input: SimulatorInput, benchmark?: GrowthBenchmark): SimulatorResult {
  const scores: SimulatorScores = {
    growthPotential: scoreGrowthPotential(input),
    optimization: scoreOptimization(input),
    viralProbability: scoreViralProbability(input),
  };

  const avgScore = Math.round((scores.growthPotential + scores.optimization) / 2);
  const grade = getGrade(avgScore);
  const recommendations = generateRecommendations(input, scores);
  const benchmarkSummary = buildBenchmarkSummary(input, benchmark);

  return { scores, grade, recommendations, benchmarkSummary };
}

// ─── Scenario Comparison ───

export function compareScenario(
  baseline: SimulatorInput,
  scenarioInput: SimulatorInput,
  label: string
): ScenarioComparison {
  const baseScores: SimulatorScores = {
    growthPotential: scoreGrowthPotential(baseline),
    optimization: scoreOptimization(baseline),
    viralProbability: scoreViralProbability(baseline),
  };

  const scenarioScores: SimulatorScores = {
    growthPotential: scoreGrowthPotential(scenarioInput),
    optimization: scoreOptimization(scenarioInput),
    viralProbability: scoreViralProbability(scenarioInput),
  };

  return {
    label,
    baseline: baseScores,
    scenario: scenarioScores,
    delta: {
      growthPotential: scenarioScores.growthPotential - baseScores.growthPotential,
      optimization: scenarioScores.optimization - baseScores.optimization,
      viralProbability: scenarioScores.viralProbability - baseScores.viralProbability,
    },
  };
}
