import { computeGrowthReport, type GrowthReportData } from "@/modules/report";
import { mockGrowthReport } from "./growth-engine";
import { mockOpportunities } from "./opportunity-detector";
import { nichePostingWindows } from "./market-intelligence";

// Pick the entrepreneurship posting windows (matches mock user niche)
const postingWindows = nichePostingWindows.find((w) => w.niche === "entrepreneurship") ?? nichePostingWindows[0];

export const mockGrowthReportData: GrowthReportData = computeGrowthReport({
  username: "@creator.studio",
  platform: "Instagram",
  niche: "Entrepreneurship",
  growthReport: mockGrowthReport,
  opportunities: mockOpportunities,
  postingWindows,
  viralProbability: 62,
});
