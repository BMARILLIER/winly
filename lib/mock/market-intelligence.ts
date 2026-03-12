import {
  computeMarketIntelligence,
  type Niche,
  type ContentFormat,
  type AudienceTier,
  type Platform,
  type NicheFormatRanking,
  type ContentPattern,
  type AudienceBehavior,
  type NichePostingWindows,
  type GrowthBenchmark,
  type WinningStrategy,
  type MarketInsight,
  type UserMetrics,
  type MarketIntelligenceReport,
  type FormatPerformance,
  type PostingWindow,
} from "@/modules/market-intelligence";

// ─── Format Performance by Niche ───

export const nicheFormatRankings: NicheFormatRanking[] = [
  {
    niche: "entrepreneurship",
    platform: "instagram",
    rankings: [
      { format: "carousel", avgEngagementRate: 0.058, avgReach: 12400, avgSaveRate: 0.032, avgShareRate: 0.018, sampleSize: 4280 },
      { format: "reel", avgEngagementRate: 0.047, avgReach: 18600, avgSaveRate: 0.014, avgShareRate: 0.022, sampleSize: 5120 },
      { format: "static_image", avgEngagementRate: 0.031, avgReach: 6200, avgSaveRate: 0.008, avgShareRate: 0.005, sampleSize: 3840 },
      { format: "story", avgEngagementRate: 0.025, avgReach: 3100, avgSaveRate: 0.003, avgShareRate: 0.002, sampleSize: 6200 },
      { format: "video", avgEngagementRate: 0.042, avgReach: 9800, avgSaveRate: 0.019, avgShareRate: 0.015, sampleSize: 1420 },
    ],
  },
  {
    niche: "fitness",
    platform: "instagram",
    rankings: [
      { format: "reel", avgEngagementRate: 0.065, avgReach: 22100, avgSaveRate: 0.028, avgShareRate: 0.024, sampleSize: 7800 },
      { format: "carousel", avgEngagementRate: 0.052, avgReach: 10200, avgSaveRate: 0.035, avgShareRate: 0.012, sampleSize: 3100 },
      { format: "video", avgEngagementRate: 0.048, avgReach: 15400, avgSaveRate: 0.022, avgShareRate: 0.019, sampleSize: 2400 },
      { format: "static_image", avgEngagementRate: 0.028, avgReach: 5600, avgSaveRate: 0.006, avgShareRate: 0.004, sampleSize: 4200 },
      { format: "story", avgEngagementRate: 0.022, avgReach: 2800, avgSaveRate: 0.004, avgShareRate: 0.002, sampleSize: 5600 },
    ],
  },
  {
    niche: "tech",
    platform: "instagram",
    rankings: [
      { format: "carousel", avgEngagementRate: 0.054, avgReach: 11800, avgSaveRate: 0.038, avgShareRate: 0.021, sampleSize: 2900 },
      { format: "reel", avgEngagementRate: 0.044, avgReach: 16200, avgSaveRate: 0.016, avgShareRate: 0.019, sampleSize: 3600 },
      { format: "thread", avgEngagementRate: 0.041, avgReach: 8400, avgSaveRate: 0.029, avgShareRate: 0.025, sampleSize: 1200 },
      { format: "video", avgEngagementRate: 0.039, avgReach: 13600, avgSaveRate: 0.024, avgShareRate: 0.016, sampleSize: 1800 },
      { format: "static_image", avgEngagementRate: 0.026, avgReach: 4800, avgSaveRate: 0.009, avgShareRate: 0.005, sampleSize: 2400 },
    ],
  },
  {
    niche: "finance",
    platform: "instagram",
    rankings: [
      { format: "carousel", avgEngagementRate: 0.061, avgReach: 14200, avgSaveRate: 0.042, avgShareRate: 0.024, sampleSize: 3200 },
      { format: "reel", avgEngagementRate: 0.045, avgReach: 19800, avgSaveRate: 0.018, avgShareRate: 0.020, sampleSize: 4100 },
      { format: "video", avgEngagementRate: 0.038, avgReach: 11200, avgSaveRate: 0.026, avgShareRate: 0.014, sampleSize: 1600 },
      { format: "static_image", avgEngagementRate: 0.029, avgReach: 5400, avgSaveRate: 0.012, avgShareRate: 0.006, sampleSize: 2800 },
      { format: "story", avgEngagementRate: 0.020, avgReach: 2600, avgSaveRate: 0.005, avgShareRate: 0.003, sampleSize: 3400 },
    ],
  },
  {
    niche: "marketing",
    platform: "instagram",
    rankings: [
      { format: "carousel", avgEngagementRate: 0.056, avgReach: 13100, avgSaveRate: 0.036, avgShareRate: 0.022, sampleSize: 3800 },
      { format: "reel", avgEngagementRate: 0.049, avgReach: 17400, avgSaveRate: 0.015, avgShareRate: 0.021, sampleSize: 4600 },
      { format: "thread", avgEngagementRate: 0.043, avgReach: 9200, avgSaveRate: 0.028, avgShareRate: 0.026, sampleSize: 1400 },
      { format: "video", avgEngagementRate: 0.040, avgReach: 12000, avgSaveRate: 0.020, avgShareRate: 0.016, sampleSize: 2000 },
      { format: "static_image", avgEngagementRate: 0.027, avgReach: 5000, avgSaveRate: 0.010, avgShareRate: 0.006, sampleSize: 3200 },
    ],
  },
  {
    niche: "lifestyle",
    platform: "instagram",
    rankings: [
      { format: "reel", avgEngagementRate: 0.062, avgReach: 20400, avgSaveRate: 0.020, avgShareRate: 0.026, sampleSize: 6400 },
      { format: "carousel", avgEngagementRate: 0.048, avgReach: 9800, avgSaveRate: 0.024, avgShareRate: 0.014, sampleSize: 3600 },
      { format: "story", avgEngagementRate: 0.034, avgReach: 4200, avgSaveRate: 0.008, avgShareRate: 0.006, sampleSize: 7200 },
      { format: "static_image", avgEngagementRate: 0.032, avgReach: 7200, avgSaveRate: 0.010, avgShareRate: 0.007, sampleSize: 4800 },
      { format: "video", avgEngagementRate: 0.044, avgReach: 14800, avgSaveRate: 0.018, avgShareRate: 0.020, sampleSize: 2200 },
    ],
  },
  {
    niche: "wellness",
    platform: "instagram",
    rankings: [
      { format: "carousel", avgEngagementRate: 0.055, avgReach: 11400, avgSaveRate: 0.040, avgShareRate: 0.016, sampleSize: 2600 },
      { format: "reel", avgEngagementRate: 0.050, avgReach: 16800, avgSaveRate: 0.018, avgShareRate: 0.020, sampleSize: 3800 },
      { format: "video", avgEngagementRate: 0.046, avgReach: 13200, avgSaveRate: 0.028, avgShareRate: 0.018, sampleSize: 1800 },
      { format: "static_image", avgEngagementRate: 0.030, avgReach: 5800, avgSaveRate: 0.014, avgShareRate: 0.006, sampleSize: 3000 },
      { format: "story", avgEngagementRate: 0.024, avgReach: 3000, avgSaveRate: 0.006, avgShareRate: 0.004, sampleSize: 4800 },
    ],
  },
  {
    niche: "travel",
    platform: "instagram",
    rankings: [
      { format: "reel", avgEngagementRate: 0.068, avgReach: 24600, avgSaveRate: 0.026, avgShareRate: 0.030, sampleSize: 5200 },
      { format: "carousel", avgEngagementRate: 0.050, avgReach: 11000, avgSaveRate: 0.032, avgShareRate: 0.018, sampleSize: 2800 },
      { format: "video", avgEngagementRate: 0.052, avgReach: 18200, avgSaveRate: 0.022, avgShareRate: 0.024, sampleSize: 2000 },
      { format: "static_image", avgEngagementRate: 0.035, avgReach: 8400, avgSaveRate: 0.012, avgShareRate: 0.008, sampleSize: 4000 },
      { format: "story", avgEngagementRate: 0.028, avgReach: 3600, avgSaveRate: 0.008, avgShareRate: 0.005, sampleSize: 5400 },
    ],
  },
];

// ─── Content Patterns ───

export const contentPatterns: ContentPattern[] = [
  {
    id: "cp_1", niche: "entrepreneurship",
    pattern: "Educational carousels with numbered tips outperform motivational quotes by 42% in engagement.",
    confidence: 88, impactLevel: "high", audienceTier: "micro",
    relatedFormats: ["carousel"],
  },
  {
    id: "cp_2", niche: "entrepreneurship",
    pattern: "Posts with a personal failure story as hook see 2.3x higher save rates.",
    confidence: 82, impactLevel: "high", audienceTier: "micro",
    relatedFormats: ["carousel", "reel"],
  },
  {
    id: "cp_3", niche: "fitness",
    pattern: "Before/after transformation reels drive 3.1x more shares than workout tutorials.",
    confidence: 91, impactLevel: "high", audienceTier: "mid",
    relatedFormats: ["reel", "video"],
  },
  {
    id: "cp_4", niche: "fitness",
    pattern: "Short workout carousels (5 slides or less) outperform longer ones by 28%.",
    confidence: 79, impactLevel: "medium", audienceTier: "nano",
    relatedFormats: ["carousel"],
  },
  {
    id: "cp_5", niche: "tech",
    pattern: "Tool comparison carousels drive the highest save rates in the tech niche (4.2%).",
    confidence: 85, impactLevel: "high", audienceTier: "micro",
    relatedFormats: ["carousel"],
  },
  {
    id: "cp_6", niche: "tech",
    pattern: "Behind-the-scenes coding reels see 1.8x higher comment rates.",
    confidence: 74, impactLevel: "medium", audienceTier: "nano",
    relatedFormats: ["reel"],
  },
  {
    id: "cp_7", niche: "finance",
    pattern: "Step-by-step money carousels with bold numbers get 52% more saves.",
    confidence: 86, impactLevel: "high", audienceTier: "micro",
    relatedFormats: ["carousel"],
  },
  {
    id: "cp_8", niche: "marketing",
    pattern: "Case study breakdowns generate 2.1x engagement versus generic tips.",
    confidence: 83, impactLevel: "high", audienceTier: "mid",
    relatedFormats: ["carousel", "thread"],
  },
  {
    id: "cp_9", niche: "lifestyle",
    pattern: "Day-in-the-life reels consistently rank in top 10% by reach.",
    confidence: 90, impactLevel: "high", audienceTier: "mid",
    relatedFormats: ["reel"],
  },
  {
    id: "cp_10", niche: "wellness",
    pattern: "Calm, slow-paced reels with text overlays outperform fast-cut edits by 35%.",
    confidence: 77, impactLevel: "medium", audienceTier: "micro",
    relatedFormats: ["reel", "video"],
  },
  {
    id: "cp_11", niche: "travel",
    pattern: "Destination reveal reels with suspense hooks see 4x average shares.",
    confidence: 87, impactLevel: "high", audienceTier: "mid",
    relatedFormats: ["reel"],
  },
  {
    id: "cp_12", niche: "entrepreneurship",
    pattern: "Accounts posting 4+ times/week consistently outgrow 2x/week accounts by 60%.",
    confidence: 92, impactLevel: "high", audienceTier: "nano",
    relatedFormats: ["carousel", "reel", "static_image"],
  },
];

// ─── Audience Behavior ───

export const audienceBehaviors: AudienceBehavior[] = [
  { id: "ab_1", niche: "entrepreneurship", audienceTier: "micro", insight: "Accounts between 10K-50K followers see stronger save rates with short hooks under 8 words.", metric: "save_rate", value: 0.034, benchmark: 0.022, direction: "above" },
  { id: "ab_2", niche: "entrepreneurship", audienceTier: "nano", insight: "Nano accounts get 2x more comments per follower than macro accounts in this niche.", metric: "comment_rate", value: 0.018, benchmark: 0.009, direction: "above" },
  { id: "ab_3", niche: "fitness", audienceTier: "mid", insight: "Mid-tier fitness accounts see peak engagement on workout content posted before 8 AM.", metric: "engagement_rate", value: 0.058, benchmark: 0.042, direction: "above" },
  { id: "ab_4", niche: "tech", audienceTier: "micro", insight: "Tech micro-creators with consistent tutorial series retain 40% more followers month-over-month.", metric: "retention_rate", value: 0.92, benchmark: 0.78, direction: "above" },
  { id: "ab_5", niche: "finance", audienceTier: "micro", insight: "Finance audiences save carousel posts 3.4x more than reels in the 5K-25K bracket.", metric: "save_ratio", value: 3.4, benchmark: 1.0, direction: "above" },
  { id: "ab_6", niche: "marketing", audienceTier: "mid", insight: "Marketing accounts with weekly case studies grow followers 55% faster than those without.", metric: "growth_rate", value: 0.068, benchmark: 0.044, direction: "above" },
  { id: "ab_7", niche: "lifestyle", audienceTier: "mid", insight: "Lifestyle audiences engage most with authentic, unfiltered content — polished posts see 18% less engagement.", metric: "engagement_rate", value: 0.052, benchmark: 0.062, direction: "below" },
  { id: "ab_8", niche: "wellness", audienceTier: "nano", insight: "Wellness nano-creators with a calm visual aesthetic retain followers 25% longer.", metric: "retention_rate", value: 0.88, benchmark: 0.70, direction: "above" },
  { id: "ab_9", niche: "travel", audienceTier: "macro", insight: "Travel macro accounts see diminishing returns on static images — reels outperform by 120%.", metric: "reach_multiplier", value: 2.2, benchmark: 1.0, direction: "above" },
  { id: "ab_10", niche: "entrepreneurship", audienceTier: "mid", insight: "Mid-tier entrepreneurship accounts that reply to 80%+ comments see 32% higher engagement next post.", metric: "engagement_boost", value: 1.32, benchmark: 1.0, direction: "above" },
];

// ─── Posting Windows ───

export const nichePostingWindows: NichePostingWindows[] = [
  {
    niche: "entrepreneurship", platform: "instagram",
    windows: [
      { day: "Tuesday", hourStart: 9, hourEnd: 11, engagementMultiplier: 1.34, confidence: 88 },
      { day: "Thursday", hourStart: 9, hourEnd: 11, engagementMultiplier: 1.28, confidence: 85 },
      { day: "Wednesday", hourStart: 12, hourEnd: 14, engagementMultiplier: 1.18, confidence: 78 },
      { day: "Monday", hourStart: 8, hourEnd: 10, engagementMultiplier: 1.12, confidence: 72 },
      { day: "Sunday", hourStart: 18, hourEnd: 20, engagementMultiplier: 1.08, confidence: 65 },
    ],
    bestWindow: { day: "Tuesday", hourStart: 9, hourEnd: 11, engagementMultiplier: 1.34, confidence: 88 },
  },
  {
    niche: "fitness", platform: "instagram",
    windows: [
      { day: "Monday", hourStart: 6, hourEnd: 8, engagementMultiplier: 1.42, confidence: 90 },
      { day: "Wednesday", hourStart: 6, hourEnd: 8, engagementMultiplier: 1.36, confidence: 86 },
      { day: "Friday", hourStart: 17, hourEnd: 19, engagementMultiplier: 1.22, confidence: 80 },
      { day: "Saturday", hourStart: 8, hourEnd: 10, engagementMultiplier: 1.18, confidence: 74 },
    ],
    bestWindow: { day: "Monday", hourStart: 6, hourEnd: 8, engagementMultiplier: 1.42, confidence: 90 },
  },
  {
    niche: "tech", platform: "instagram",
    windows: [
      { day: "Tuesday", hourStart: 10, hourEnd: 12, engagementMultiplier: 1.30, confidence: 84 },
      { day: "Thursday", hourStart: 10, hourEnd: 12, engagementMultiplier: 1.26, confidence: 82 },
      { day: "Wednesday", hourStart: 14, hourEnd: 16, engagementMultiplier: 1.14, confidence: 70 },
    ],
    bestWindow: { day: "Tuesday", hourStart: 10, hourEnd: 12, engagementMultiplier: 1.30, confidence: 84 },
  },
  {
    niche: "finance", platform: "instagram",
    windows: [
      { day: "Tuesday", hourStart: 8, hourEnd: 10, engagementMultiplier: 1.38, confidence: 87 },
      { day: "Thursday", hourStart: 8, hourEnd: 10, engagementMultiplier: 1.32, confidence: 84 },
      { day: "Monday", hourStart: 12, hourEnd: 14, engagementMultiplier: 1.16, confidence: 72 },
    ],
    bestWindow: { day: "Tuesday", hourStart: 8, hourEnd: 10, engagementMultiplier: 1.38, confidence: 87 },
  },
  {
    niche: "marketing", platform: "instagram",
    windows: [
      { day: "Wednesday", hourStart: 9, hourEnd: 11, engagementMultiplier: 1.32, confidence: 86 },
      { day: "Tuesday", hourStart: 9, hourEnd: 11, engagementMultiplier: 1.28, confidence: 83 },
      { day: "Thursday", hourStart: 14, hourEnd: 16, engagementMultiplier: 1.20, confidence: 76 },
    ],
    bestWindow: { day: "Wednesday", hourStart: 9, hourEnd: 11, engagementMultiplier: 1.32, confidence: 86 },
  },
  {
    niche: "lifestyle", platform: "instagram",
    windows: [
      { day: "Sunday", hourStart: 10, hourEnd: 12, engagementMultiplier: 1.36, confidence: 88 },
      { day: "Saturday", hourStart: 10, hourEnd: 12, engagementMultiplier: 1.30, confidence: 84 },
      { day: "Wednesday", hourStart: 18, hourEnd: 20, engagementMultiplier: 1.18, confidence: 72 },
    ],
    bestWindow: { day: "Sunday", hourStart: 10, hourEnd: 12, engagementMultiplier: 1.36, confidence: 88 },
  },
  {
    niche: "wellness", platform: "instagram",
    windows: [
      { day: "Monday", hourStart: 7, hourEnd: 9, engagementMultiplier: 1.34, confidence: 86 },
      { day: "Thursday", hourStart: 7, hourEnd: 9, engagementMultiplier: 1.28, confidence: 82 },
      { day: "Sunday", hourStart: 9, hourEnd: 11, engagementMultiplier: 1.22, confidence: 76 },
    ],
    bestWindow: { day: "Monday", hourStart: 7, hourEnd: 9, engagementMultiplier: 1.34, confidence: 86 },
  },
  {
    niche: "travel", platform: "instagram",
    windows: [
      { day: "Friday", hourStart: 17, hourEnd: 19, engagementMultiplier: 1.40, confidence: 89 },
      { day: "Sunday", hourStart: 11, hourEnd: 13, engagementMultiplier: 1.32, confidence: 84 },
      { day: "Thursday", hourStart: 12, hourEnd: 14, engagementMultiplier: 1.18, confidence: 72 },
    ],
    bestWindow: { day: "Friday", hourStart: 17, hourEnd: 19, engagementMultiplier: 1.40, confidence: 89 },
  },
];

// ─── Growth Benchmarks ───

export const growthBenchmarks: GrowthBenchmark[] = [
  {
    niche: "entrepreneurship", audienceTier: "micro", platform: "instagram",
    metrics: {
      engagementRate: { p25: 0.025, p50: 0.038, p75: 0.052, p90: 0.068 },
      saveRate: { p25: 0.008, p50: 0.018, p75: 0.030, p90: 0.045 },
      shareRate: { p25: 0.004, p50: 0.010, p75: 0.018, p90: 0.028 },
      followerGrowthMonthly: { p25: 0.012, p50: 0.028, p75: 0.048, p90: 0.075 },
      postsPerWeek: { p25: 2, p50: 3.5, p75: 5, p90: 7 },
    },
  },
  {
    niche: "fitness", audienceTier: "micro", platform: "instagram",
    metrics: {
      engagementRate: { p25: 0.028, p50: 0.042, p75: 0.058, p90: 0.078 },
      saveRate: { p25: 0.010, p50: 0.022, p75: 0.036, p90: 0.052 },
      shareRate: { p25: 0.005, p50: 0.012, p75: 0.022, p90: 0.034 },
      followerGrowthMonthly: { p25: 0.015, p50: 0.032, p75: 0.055, p90: 0.082 },
      postsPerWeek: { p25: 3, p50: 4.5, p75: 6, p90: 8 },
    },
  },
  {
    niche: "tech", audienceTier: "micro", platform: "instagram",
    metrics: {
      engagementRate: { p25: 0.022, p50: 0.035, p75: 0.048, p90: 0.062 },
      saveRate: { p25: 0.012, p50: 0.024, p75: 0.038, p90: 0.054 },
      shareRate: { p25: 0.006, p50: 0.014, p75: 0.024, p90: 0.036 },
      followerGrowthMonthly: { p25: 0.010, p50: 0.024, p75: 0.042, p90: 0.065 },
      postsPerWeek: { p25: 2, p50: 3, p75: 5, p90: 7 },
    },
  },
  {
    niche: "finance", audienceTier: "micro", platform: "instagram",
    metrics: {
      engagementRate: { p25: 0.024, p50: 0.036, p75: 0.050, p90: 0.066 },
      saveRate: { p25: 0.014, p50: 0.028, p75: 0.042, p90: 0.060 },
      shareRate: { p25: 0.005, p50: 0.012, p75: 0.020, p90: 0.032 },
      followerGrowthMonthly: { p25: 0.014, p50: 0.030, p75: 0.050, p90: 0.072 },
      postsPerWeek: { p25: 2.5, p50: 4, p75: 5.5, p90: 7 },
    },
  },
  {
    niche: "marketing", audienceTier: "micro", platform: "instagram",
    metrics: {
      engagementRate: { p25: 0.023, p50: 0.036, p75: 0.050, p90: 0.064 },
      saveRate: { p25: 0.010, p50: 0.022, p75: 0.034, p90: 0.050 },
      shareRate: { p25: 0.006, p50: 0.014, p75: 0.024, p90: 0.036 },
      followerGrowthMonthly: { p25: 0.012, p50: 0.026, p75: 0.045, p90: 0.068 },
      postsPerWeek: { p25: 2, p50: 3.5, p75: 5, p90: 7 },
    },
  },
  {
    niche: "lifestyle", audienceTier: "micro", platform: "instagram",
    metrics: {
      engagementRate: { p25: 0.026, p50: 0.040, p75: 0.056, p90: 0.074 },
      saveRate: { p25: 0.006, p50: 0.014, p75: 0.024, p90: 0.038 },
      shareRate: { p25: 0.004, p50: 0.010, p75: 0.018, p90: 0.028 },
      followerGrowthMonthly: { p25: 0.014, p50: 0.030, p75: 0.052, p90: 0.078 },
      postsPerWeek: { p25: 3, p50: 4.5, p75: 6, p90: 8 },
    },
  },
  {
    niche: "wellness", audienceTier: "micro", platform: "instagram",
    metrics: {
      engagementRate: { p25: 0.024, p50: 0.037, p75: 0.052, p90: 0.068 },
      saveRate: { p25: 0.012, p50: 0.026, p75: 0.040, p90: 0.056 },
      shareRate: { p25: 0.004, p50: 0.010, p75: 0.018, p90: 0.028 },
      followerGrowthMonthly: { p25: 0.010, p50: 0.024, p75: 0.042, p90: 0.064 },
      postsPerWeek: { p25: 2, p50: 3.5, p75: 5, p90: 7 },
    },
  },
  {
    niche: "travel", audienceTier: "micro", platform: "instagram",
    metrics: {
      engagementRate: { p25: 0.028, p50: 0.044, p75: 0.062, p90: 0.080 },
      saveRate: { p25: 0.008, p50: 0.018, p75: 0.030, p90: 0.046 },
      shareRate: { p25: 0.006, p50: 0.014, p75: 0.026, p90: 0.040 },
      followerGrowthMonthly: { p25: 0.016, p50: 0.034, p75: 0.058, p90: 0.085 },
      postsPerWeek: { p25: 2, p50: 3, p75: 5, p90: 7 },
    },
  },
];

// ─── Winning Strategies ───

export const winningStrategies: WinningStrategy[] = [
  {
    id: "ws_1", niche: "entrepreneurship",
    title: "The Educational Carousel Flywheel",
    description: "Consistently publish 3-4 educational carousels per week with numbered tips. This creates a save-loop where high save rates boost algorithmic distribution, bringing new followers who then save more.",
    evidenceStrength: "strong", appliesTo: ["nano", "micro", "mid"],
    recommendedFormats: ["carousel"], expectedImpact: "40-60% engagement increase over 8 weeks",
  },
  {
    id: "ws_2", niche: "fitness",
    title: "The Transformation Reel Engine",
    description: "Lead with before/after hooks in reels (3-5s reveal). Pair each reel with a carousel breakdown of the method. This dual-format approach captures both reach (reel) and depth (carousel).",
    evidenceStrength: "strong", appliesTo: ["nano", "micro", "mid"],
    recommendedFormats: ["reel", "carousel"], expectedImpact: "3x share rate, 50% follower growth acceleration",
  },
  {
    id: "ws_3", niche: "tech",
    title: "The Tutorial Series Lock-in",
    description: "Create a weekly tutorial series with a consistent format. Followers who engage with episode 1 are 4x more likely to engage with all subsequent episodes, dramatically boosting retention.",
    evidenceStrength: "moderate", appliesTo: ["nano", "micro"],
    recommendedFormats: ["carousel", "video"], expectedImpact: "40% higher follower retention, 25% more saves",
  },
  {
    id: "ws_4", niche: "finance",
    title: "The Numbers-First Carousel",
    description: "Lead every carousel slide with a bold number or statistic. Finance audiences are data-driven — posts with numbers in the first slide see 52% more saves and 35% more shares.",
    evidenceStrength: "strong", appliesTo: ["micro", "mid"],
    recommendedFormats: ["carousel"], expectedImpact: "50% save rate increase, 30% higher reach",
  },
  {
    id: "ws_5", niche: "marketing",
    title: "The Case Study Breakdown",
    description: "Publish weekly case study breakdowns of real campaigns or brands. Add your unique take. This positions you as an analyst, not just another tips account — driving 2x engagement.",
    evidenceStrength: "moderate", appliesTo: ["micro", "mid", "macro"],
    recommendedFormats: ["carousel", "thread"], expectedImpact: "2x engagement, stronger authority positioning",
  },
  {
    id: "ws_6", niche: "lifestyle",
    title: "The Authentic Day-in-Life",
    description: "Unfiltered, authentic day-in-the-life reels consistently outperform polished content by 35%. Lean into imperfection — your audience values realness over production quality.",
    evidenceStrength: "strong", appliesTo: ["nano", "micro", "mid"],
    recommendedFormats: ["reel"], expectedImpact: "35% engagement lift, 2x share rate",
  },
  {
    id: "ws_7", niche: "wellness",
    title: "The Slow Content Approach",
    description: "Calm, slow-paced content with text overlays and soft music outperforms fast edits. Wellness audiences seek peace — match your content pace to their mindset.",
    evidenceStrength: "moderate", appliesTo: ["nano", "micro"],
    recommendedFormats: ["reel", "video"], expectedImpact: "35% higher engagement, 20% more saves",
  },
  {
    id: "ws_8", niche: "travel",
    title: "The Destination Suspense Hook",
    description: "Start reels with 'Guess where this is' or a dramatic landscape reveal. Suspense hooks in travel content drive 4x shares — people tag friends they want to travel with.",
    evidenceStrength: "strong", appliesTo: ["micro", "mid", "macro"],
    recommendedFormats: ["reel"], expectedImpact: "4x shares, 60% reach boost",
  },
];

// ─── Market Insights ───

export const marketInsights: MarketInsight[] = [
  { id: "mi_1", category: "format", niche: "entrepreneurship", text: "In the entrepreneurship niche, educational carousels outperform reels by 24% in engagement rate.", confidence: 88, isActionable: true },
  { id: "mi_2", category: "audience", niche: "entrepreneurship", text: "Accounts between 10K and 50K followers see stronger save rates with short hooks.", confidence: 82, isActionable: true },
  { id: "mi_3", category: "timing", niche: "entrepreneurship", text: "Tuesday and Thursday 9-11 AM show the strongest engagement pattern in entrepreneurship.", confidence: 88, isActionable: true },
  { id: "mi_4", category: "format", niche: "fitness", text: "Reels dominate the fitness niche with 65% higher reach than carousels.", confidence: 91, isActionable: true },
  { id: "mi_5", category: "pattern", niche: "fitness", text: "Transformation content drives 3.1x more shares than standard workout tutorials.", confidence: 91, isActionable: true },
  { id: "mi_6", category: "benchmark", niche: "tech", text: "Top 10% tech creators post 7+ times/week and maintain 6.2%+ engagement.", confidence: 85, isActionable: false },
  { id: "mi_7", category: "format", niche: "tech", text: "Tool comparison carousels achieve the highest save rate in tech (4.2%).", confidence: 85, isActionable: true },
  { id: "mi_8", category: "strategy", niche: "finance", text: "Finance carousels with bold numbers in slide 1 see 52% more saves.", confidence: 86, isActionable: true },
  { id: "mi_9", category: "pattern", niche: "marketing", text: "Weekly case study breakdowns generate 2.1x engagement versus generic tips.", confidence: 83, isActionable: true },
  { id: "mi_10", category: "audience", niche: "lifestyle", text: "Lifestyle audiences prefer authentic, unfiltered content — polished posts see 18% less engagement.", confidence: 90, isActionable: true },
  { id: "mi_11", category: "timing", niche: "lifestyle", text: "Weekend mornings (Sat-Sun 10AM-12PM) are the best posting windows for lifestyle content.", confidence: 88, isActionable: true },
  { id: "mi_12", category: "format", niche: "wellness", text: "Slow-paced reels with text overlays outperform fast-cut edits by 35% in wellness.", confidence: 77, isActionable: true },
  { id: "mi_13", category: "strategy", niche: "travel", text: "Suspense-hook reels drive 4x shares — people tag friends they want to travel with.", confidence: 87, isActionable: true },
  { id: "mi_14", category: "benchmark", niche: "entrepreneurship", text: "Median entrepreneurship creator posts 3.5x/week with 3.8% engagement.", confidence: 92, isActionable: false },
  { id: "mi_15", category: "pattern", niche: "entrepreneurship", text: "Accounts posting 4+ times/week outgrow 2x/week accounts by 60%.", confidence: 92, isActionable: true },
  { id: "mi_16", category: "audience", niche: "finance", text: "Finance audiences save carousel posts 3.4x more than reels.", confidence: 86, isActionable: true },
];

// ─── Mock User Metrics (for benchmark comparison) ───

export const mockUserMetrics: UserMetrics = {
  engagementRate: 0.042,
  saveRate: 0.024,
  shareRate: 0.012,
  followerGrowthMonthly: 0.035,
  postsPerWeek: 4.5,
  topFormat: "reel" as ContentFormat,
  niche: "entrepreneurship" as Niche,
  audienceTier: "micro" as AudienceTier,
  platform: "instagram" as Platform,
  consistency: 72,
};

// ─── Computed Report ───

const userBenchmark = growthBenchmarks.find(
  (b) => b.niche === mockUserMetrics.niche && b.audienceTier === mockUserMetrics.audienceTier
)!;

const userNicheRanking = nicheFormatRankings.find(
  (r) => r.niche === mockUserMetrics.niche
)!;

export const mockMarketReport: MarketIntelligenceReport = computeMarketIntelligence(
  mockUserMetrics,
  userBenchmark,
  userNicheRanking,
  marketInsights
);
