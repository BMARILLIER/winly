import { detectOpportunities, type OpportunityInput, type Opportunity } from "@/modules/opportunity-detector";

export const mockOpportunityInput: OpportunityInput = {
  engagementMomentum: 1.6,
  topicFitScore: 0.82,
  trendAlignmentScore: 0.75,
  trendVolume: 72,
  trendName: "Personal Branding",
  peakWindowClarity: 0.88,
  peakHourLabel: "Tue & Thu 9-11 AM",
  savesSharesAvg: 85,
  reachAvg: 4200,
  currentPostFreq: 3.5,
  bestPostFreq: 5.0,
  followerGrowthRate: 0.065,
  baselineGrowthRate: 0.03,
  bestFormatEngagement: 0.068,
  bestFormatUsage: 0.25,
  bestFormatName: "Carousels",
};

export const mockOpportunities: Opportunity[] = detectOpportunities(mockOpportunityInput);
