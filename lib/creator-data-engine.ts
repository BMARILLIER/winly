/**
 * Creator Intelligence Data Engine
 *
 * Centralise toutes les données créateur utilisées par les modules :
 * - Creator Genome (profil + métriques + historique)
 * - Content Lab (formats, hooks, timing)
 * - Growth Diagnosis (engagement, régularité, portée)
 * - Market Radar (benchmarks niche)
 * - Viral Score (facteurs de viralité)
 *
 * Point d'accès unique. Chaque module importe depuis ici.
 * Données mockées par défaut, remplaçables par connecteurs réels.
 */

import type { Niche, ContentFormat, Platform, AudienceTier } from "@/types";

// ─── Core Creator Profile ───

export interface CreatorProfile {
  username: string;
  platform: Platform;
  niche: Niche;
  tier: AudienceTier;
  profileType: "personal" | "business" | "anonymous";
  followerCount: number;
  postFrequency: number; // posts/week
}

// ─── Content Performance Data ───

export interface ContentRecord {
  id: string;
  format: ContentFormat;
  duration: "short" | "medium" | "long"; // <30s, 30-60s, >60s
  hookType: "curiosity" | "storytelling" | "educational" | "controversial" | "statistical";
  publishedAt: string; // ISO date
  publishHour: number; // 0-23
  publishDay: number; // 0-6 (dimanche=0)
  metrics: ContentMetrics;
}

export interface ContentMetrics {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  engagementRate: number; // 0-1
}

// ─── Growth Snapshot ───

export interface GrowthSnapshot {
  date: string;
  followers: number;
  followersGained: number;
  engagementRate: number;
  reach: number;
  postsCount: number;
}

// ─── Aggregated Creator Data ───

export interface CreatorIntelligenceData {
  profile: CreatorProfile;
  contentHistory: ContentRecord[];
  growthHistory: GrowthSnapshot[];
  aggregated: AggregatedMetrics;
}

export interface AggregatedMetrics {
  avgEngagementRate: number;
  avgReach: number;
  topFormat: ContentFormat;
  topHookType: string;
  bestPublishHour: number;
  bestPublishDay: number;
  postsLast30d: number;
  maxGapDays: number;
  savesTotal: number;
  sharesTotal: number;
  commentsTotal: number;
  likesTotal: number;
  followerGrowthMonthly: number; // %
}

// ─── Mock Data Factory ───

function generateMockContentHistory(): ContentRecord[] {
  const formats: ContentFormat[] = ["reel", "carousel", "static_image", "story", "video", "thread"];
  const hookTypes: ContentRecord["hookType"][] = ["curiosity", "storytelling", "educational", "controversial", "statistical"];
  const records: ContentRecord[] = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(2026, 2, 9);
    date.setDate(date.getDate() - i * 2);
    const format = formats[i % formats.length];
    const isReel = format === "reel" || format === "video";
    const baseEngagement = isReel ? 0.055 : 0.035;
    const hour = [7, 9, 12, 18, 19, 20, 21][i % 7];

    records.push({
      id: `content_${i}`,
      format,
      duration: isReel ? (i % 3 === 0 ? "short" : "medium") : "long",
      hookType: hookTypes[i % hookTypes.length],
      publishedAt: date.toISOString().slice(0, 10),
      publishHour: hour,
      publishDay: date.getDay(),
      metrics: {
        likes: 150 + Math.round(Math.sin(i * 0.5) * 80 + Math.random() * 100),
        comments: 20 + Math.round(Math.random() * 30),
        shares: 10 + Math.round(Math.random() * 25),
        saves: 30 + Math.round(Math.random() * 40),
        reach: 2000 + Math.round(Math.sin(i * 0.3) * 800 + Math.random() * 1500),
        impressions: 3000 + Math.round(Math.random() * 2000),
        engagementRate: baseEngagement + (Math.random() - 0.3) * 0.02,
      },
    });
  }

  return records;
}

function generateMockGrowthHistory(): GrowthSnapshot[] {
  const snapshots: GrowthSnapshot[] = [];
  let followers = 18500;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(2026, 2, 9);
    date.setDate(date.getDate() - i);
    const gained = 50 + Math.round(Math.random() * 100);
    followers += gained;

    snapshots.push({
      date: date.toISOString().slice(0, 10),
      followers,
      followersGained: gained,
      engagementRate: 0.035 + (Math.random() - 0.3) * 0.015,
      reach: 1500 + Math.round(Math.random() * 2000),
      postsCount: Math.random() > 0.3 ? 1 : 0,
    });
  }

  return snapshots;
}

function computeAggregated(content: ContentRecord[], growth: GrowthSnapshot[]): AggregatedMetrics {
  if (content.length === 0) {
    return {
      avgEngagementRate: 0, avgReach: 0, topFormat: "reel", topHookType: "curiosity",
      bestPublishHour: 19, bestPublishDay: 2, postsLast30d: 0, maxGapDays: 30,
      savesTotal: 0, sharesTotal: 0, commentsTotal: 0, likesTotal: 0, followerGrowthMonthly: 0,
    };
  }

  const avgEngagement = content.reduce((s, c) => s + c.metrics.engagementRate, 0) / content.length;
  const avgReach = content.reduce((s, c) => s + c.metrics.reach, 0) / content.length;

  // Top format by engagement
  const formatEngagement: Record<string, { total: number; count: number }> = {};
  for (const c of content) {
    if (!formatEngagement[c.format]) formatEngagement[c.format] = { total: 0, count: 0 };
    formatEngagement[c.format].total += c.metrics.engagementRate;
    formatEngagement[c.format].count++;
  }
  const topFormat = (Object.entries(formatEngagement)
    .sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))[0]?.[0] ?? "reel") as ContentFormat;

  // Top hook type
  const hookEngagement: Record<string, { total: number; count: number }> = {};
  for (const c of content) {
    if (!hookEngagement[c.hookType]) hookEngagement[c.hookType] = { total: 0, count: 0 };
    hookEngagement[c.hookType].total += c.metrics.engagementRate;
    hookEngagement[c.hookType].count++;
  }
  const topHookType = Object.entries(hookEngagement)
    .sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))[0]?.[0] ?? "curiosity";

  // Best hour
  const hourEngagement: Record<number, { total: number; count: number }> = {};
  for (const c of content) {
    if (!hourEngagement[c.publishHour]) hourEngagement[c.publishHour] = { total: 0, count: 0 };
    hourEngagement[c.publishHour].total += c.metrics.engagementRate;
    hourEngagement[c.publishHour].count++;
  }
  const bestHour = Number(Object.entries(hourEngagement)
    .sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))[0]?.[0] ?? 19);

  // Best day
  const dayEngagement: Record<number, { total: number; count: number }> = {};
  for (const c of content) {
    if (!dayEngagement[c.publishDay]) dayEngagement[c.publishDay] = { total: 0, count: 0 };
    dayEngagement[c.publishDay].total += c.metrics.engagementRate;
    dayEngagement[c.publishDay].count++;
  }
  const bestDay = Number(Object.entries(dayEngagement)
    .sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))[0]?.[0] ?? 2);

  // Gap calculation
  const dates = content.map((c) => new Date(c.publishedAt).getTime()).sort((a, b) => a - b);
  let maxGap = 0;
  for (let i = 1; i < dates.length; i++) {
    const gap = Math.round((dates[i] - dates[i - 1]) / 86400000);
    if (gap > maxGap) maxGap = gap;
  }

  // Totals
  const savesTotal = content.reduce((s, c) => s + c.metrics.saves, 0);
  const sharesTotal = content.reduce((s, c) => s + c.metrics.shares, 0);
  const commentsTotal = content.reduce((s, c) => s + c.metrics.comments, 0);
  const likesTotal = content.reduce((s, c) => s + c.metrics.likes, 0);

  // Monthly growth
  const firstFollowers = growth[0]?.followers ?? 0;
  const lastFollowers = growth[growth.length - 1]?.followers ?? 0;
  const followerGrowthMonthly = firstFollowers > 0
    ? ((lastFollowers - firstFollowers) / firstFollowers) * 100
    : 0;

  return {
    avgEngagementRate: avgEngagement,
    avgReach: Math.round(avgReach),
    topFormat,
    topHookType,
    bestPublishHour: bestHour,
    bestPublishDay: bestDay,
    postsLast30d: content.length,
    maxGapDays: maxGap,
    savesTotal,
    sharesTotal,
    commentsTotal,
    likesTotal,
    followerGrowthMonthly: Math.round(followerGrowthMonthly * 10) / 10,
  };
}

// ─── Default Mock Creator ───

const mockProfile: CreatorProfile = {
  username: "@creator.studio",
  platform: "instagram",
  niche: "entrepreneurship",
  tier: "micro",
  profileType: "personal",
  followerCount: 24800,
  postFrequency: 4.5,
};

const mockContent = generateMockContentHistory();
const mockGrowth = generateMockGrowthHistory();

// ─── Main Export ───

/**
 * Retourne les données centralisées du créateur.
 * Aujourd'hui : mock data. Demain : connecteur DB/API.
 */
export function getCreatorIntelligence(): CreatorIntelligenceData {
  const contentHistory = mockContent;
  const growthHistory = mockGrowth;
  const aggregated = computeAggregated(contentHistory, growthHistory);

  return {
    profile: mockProfile,
    contentHistory,
    growthHistory,
    aggregated,
  };
}

/**
 * Convertit les données centralisées vers le format GrowthEngineInput.
 * Permet au module growth-engine d'utiliser le data engine.
 */
export function toGrowthEngineInput(data: CreatorIntelligenceData) {
  const a = data.aggregated;
  return {
    engagementRate: a.avgEngagementRate,
    benchmarkEngagement: 0.035,
    postsLast30d: a.postsLast30d,
    targetPostsPerMonth: Math.round(data.profile.postFrequency * 4.3),
    maxGapDays: a.maxGapDays,
    reachCurrent30d: a.avgReach * a.postsLast30d,
    reachPrevious30d: a.avgReach * a.postsLast30d * 0.85,
    topFormatUsageShare: 0.55,
    formatCount: new Set(data.contentHistory.map((c) => c.format)).size,
    peakHourPostRatio: data.contentHistory.filter((c) => c.publishHour >= 17 && c.publishHour <= 21).length / Math.max(1, data.contentHistory.length),
    saves: a.savesTotal,
    shares: a.sharesTotal,
    comments: a.commentsTotal,
    likes: a.likesTotal,
  };
}

/**
 * Convertit les données centralisées vers le format SimulatorInput.
 * Permet au module viral-score/growth-simulator d'utiliser le data engine.
 */
export function toSimulatorInput(data: CreatorIntelligenceData) {
  return {
    followerCount: data.profile.followerCount,
    postsPerWeek: data.profile.postFrequency,
    niche: data.profile.niche,
    mainFormat: data.aggregated.topFormat,
    platform: data.profile.platform,
    engagementRate: data.aggregated.avgEngagementRate,
  };
}
