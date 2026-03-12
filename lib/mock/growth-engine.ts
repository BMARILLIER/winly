import { computeGrowthEngine, type GrowthEngineInput, type GrowthEngineReport } from "@/modules/growth-engine";

export const mockGrowthInput: GrowthEngineInput = {
  engagementRate: 0.042,
  benchmarkEngagement: 0.035,
  postsLast30d: 18,
  targetPostsPerMonth: 20,
  maxGapDays: 4,
  reachCurrent30d: 45200,
  reachPrevious30d: 38000,
  topFormatUsageShare: 0.55,
  formatCount: 4,
  peakHourPostRatio: 0.65,
  saves: 320,
  shares: 180,
  comments: 240,
  likes: 1850,
};

export const mockGrowthReport: GrowthEngineReport = computeGrowthEngine(mockGrowthInput);

export const growthScoreHistory = [
  { month: "Avr", score: 42 },
  { month: "Mai", score: 45 },
  { month: "Juin", score: 48 },
  { month: "Juil", score: 52 },
  { month: "Août", score: 55 },
  { month: "Sep", score: 51 },
  { month: "Oct", score: 58 },
  { month: "Nov", score: 62 },
  { month: "Déc", score: 60 },
  { month: "Jan", score: 65 },
  { month: "Fév", score: 68 },
  { month: "Mar", score: mockGrowthReport.score },
];
