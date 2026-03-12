import { computeSocialRadar, type SocialRadarInput, type SocialRadarReport } from "@/modules/social-radar";
import { nicheFormatRankings, nichePostingWindows } from "./market-intelligence";
import type { TrendRadarInput } from "@/modules/trend-radar";
import type { ContentFormat } from "@/modules/market-intelligence";

// Reuse existing mock datasets — no duplication

const mockTrendInput: TrendRadarInput = {
  niche: "business",
  platform: "instagram",
  existingTitles: ["My morning routine", "5 productivity tips"],
  existingFormats: ["carousel", "reel"],
  postFrequency: "few_per_week",
};

export const mockSocialRadarInput: SocialRadarInput = {
  trendInput: mockTrendInput,
  nicheFormatRankings,
  nichePostingWindows,
  userTopFormat: "reel" as ContentFormat,
};

export const mockSocialRadarReport: SocialRadarReport = computeSocialRadar(mockSocialRadarInput);
