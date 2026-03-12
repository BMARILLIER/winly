export type InsightCategory = "strategy" | "timing" | "audience" | "growth";
export type InsightImpact = "high" | "medium" | "low";

export interface Insight {
  id: number;
  title: string;
  description: string;
  category: InsightCategory;
  impact: InsightImpact;
  metric?: string;
  sparkline?: number[];
}

export const insights: Insight[] = [
  {
    id: 1,
    title: "Double down on carousels",
    description: "Your carousels generate 2.4x more saves than single images. Increasing frequency from 2 to 4 per week could boost profile visits by ~30%.",
    category: "strategy",
    impact: "high",
    metric: "+30% profile visits",
    sparkline: [3, 4, 3, 5, 6, 7, 8, 9, 8, 10],
  },
  {
    id: 2,
    title: "Optimal posting window: 6-8 PM",
    description: "Posts published between 6-8 PM receive 47% more engagement than morning posts. Your audience is most active during evening hours.",
    category: "timing",
    impact: "high",
    metric: "+47% engagement",
  },
  {
    id: 3,
    title: "Engage the 25-34 segment",
    description: "Your fastest-growing demographic is 25-34 year olds. Content about productivity and career tips resonates strongest with this group.",
    category: "audience",
    impact: "high",
    metric: "38% of followers",
  },
  {
    id: 4,
    title: "Reels are your growth engine",
    description: "Reels account for 65% of your new follower acquisition. Consider a 3:1 ratio of reels to other formats.",
    category: "growth",
    impact: "high",
    metric: "65% new followers",
    sparkline: [12, 15, 14, 18, 22, 25, 28, 30, 32, 35],
  },
  {
    id: 5,
    title: "Add CTAs to stories",
    description: "Stories with explicit call-to-actions see 2.1x more replies. Only 20% of your stories currently include CTAs.",
    category: "strategy",
    impact: "medium",
    metric: "2.1x replies",
  },
  {
    id: 6,
    title: "Avoid posting on Sunday mornings",
    description: "Your Sunday morning posts consistently underperform by 35%. Shift to Sunday evening for better results.",
    category: "timing",
    impact: "medium",
    metric: "-35% engagement",
  },
  {
    id: 7,
    title: "Collab opportunities detected",
    description: "3 creators in your niche with similar audience size have high engagement overlap. Cross-promotion could unlock 5-8K new followers.",
    category: "growth",
    impact: "medium",
    metric: "+5-8K followers",
  },
  {
    id: 8,
    title: "Hashtag strategy needs refresh",
    description: "Your top 5 hashtags have been the same for 60 days. Rotating hashtags weekly can increase explore page appearances by 25%.",
    category: "strategy",
    impact: "medium",
    sparkline: [8, 7, 6, 5, 5, 4, 4, 3, 3, 2],
  },
  {
    id: 9,
    title: "Reply speed matters",
    description: "Responding to comments within 1 hour boosts your engagement rate by 18%. Your average response time is currently 4.2 hours.",
    category: "audience",
    impact: "medium",
    metric: "4.2h avg response",
  },
  {
    id: 10,
    title: "Bio link underperforming",
    description: "Only 0.8% of profile visitors click your bio link. Consider A/B testing different CTAs or using a link-in-bio tool.",
    category: "strategy",
    impact: "low",
    metric: "0.8% CTR",
  },
  {
    id: 11,
    title: "Weekend content gap",
    description: "You post 40% less on weekends, but your weekend audience is more engaged. Scheduling weekend content could capture untapped engagement.",
    category: "timing",
    impact: "low",
  },
  {
    id: 12,
    title: "Micro-influencer sweet spot",
    description: "At your current size (24.8K), brands in the lifestyle niche offer the best sponsorship rates. Consider reaching out proactively.",
    category: "growth",
    impact: "low",
    metric: "Lifestyle niche",
  },
];

export const insightSummary = "Your content strategy is performing well overall. The biggest opportunity is increasing carousel frequency and leveraging the 6-8 PM posting window. Reels remain your primary growth driver, and investing in community engagement (faster replies, more CTAs) could accelerate growth by 15-20% this quarter.";
