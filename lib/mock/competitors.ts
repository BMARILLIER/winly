export interface Competitor {
  id: number;
  name: string;
  handle: string;
  followers: string;
  engagementRate: number;
  postFrequency: string;
  topFormat: string;
  growthRate: number;
  scores: {
    content: number;
    engagement: number;
    consistency: number;
    growth: number;
    reach: number;
  };
}

export const competitors: Competitor[] = [
  {
    id: 1,
    name: "CreatorPro Max",
    handle: "@creatorpromax",
    followers: "31.2K",
    engagementRate: 4.8,
    postFrequency: "5x/week",
    topFormat: "Reels",
    growthRate: 8.2,
    scores: { content: 82, engagement: 75, consistency: 90, growth: 78, reach: 85 },
  },
  {
    id: 2,
    name: "Digital Nomad Sara",
    handle: "@saranomadd",
    followers: "28.5K",
    engagementRate: 6.1,
    postFrequency: "4x/week",
    topFormat: "Carousels",
    growthRate: 14.5,
    scores: { content: 78, engagement: 88, consistency: 72, growth: 85, reach: 70 },
  },
  {
    id: 3,
    name: "The Growth Lab",
    handle: "@thegrowthlab",
    followers: "42.1K",
    engagementRate: 3.9,
    postFrequency: "7x/week",
    topFormat: "Reels",
    growthRate: 6.8,
    scores: { content: 90, engagement: 65, consistency: 95, growth: 72, reach: 92 },
  },
  {
    id: 4,
    name: "Social Spark Studio",
    handle: "@socialsparkstudio",
    followers: "19.8K",
    engagementRate: 7.2,
    postFrequency: "3x/week",
    topFormat: "Carousels",
    growthRate: 22.1,
    scores: { content: 70, engagement: 92, consistency: 60, growth: 90, reach: 65 },
  },
];

export const yourScores = {
  content: 85,
  engagement: 80,
  consistency: 78,
  growth: 82,
  reach: 76,
};

export const radarLabels = ["Content", "Engagement", "Consistency", "Growth", "Reach"];
