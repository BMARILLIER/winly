/**
 * Mock data barrel export.
 *
 * All mock datasets are local and computed on import.
 * No external APIs, no real database queries.
 *
 * When real connectors are implemented, each mock file can be
 * swapped with a real data source without changing consumers.
 */

// Dashboard & Analytics
export { dashboardKPIs, sparklineData, recommendations, quickActions } from "./dashboard";
export { engagementTimeSeries, topPosts, trafficSources, contentPerformance, analyticsKPIs } from "./analytics";

// Growth & Scoring
export { mockGrowthInput, mockGrowthReport, growthScoreHistory } from "./growth-engine";
export { followerGrowth, growthRates, demographics, activityHeatmap, dayLabels, weakSignals } from "./growth";

// Opportunities
export { mockOpportunities } from "./opportunity-detector";

// Market Intelligence
export {
  nicheFormatRankings,
  contentPatterns,
  audienceBehaviors,
  nichePostingWindows,
  growthBenchmarks,
  winningStrategies,
  marketInsights,
  mockUserMetrics,
  mockMarketReport,
} from "./market-intelligence";

// Social Radar
export { mockSocialRadarInput, mockSocialRadarReport } from "./social-radar";

// Creator Growth Report
export { mockGrowthReportData } from "./report";

// AI & Reports
export { insights as aiInsights, insightSummary } from "./ai-insights";
export { competitors, yourScores, radarLabels } from "./competitors";
export { reports } from "./reports";
