export const dashboardKPIs = [
  { label: "Followers", value: "24.8K", trend: 12.3 },
  { label: "Engagement Rate", value: "5.4%", trend: 8.1 },
  { label: "Monthly Reach", value: "892K", trend: -2.4 },
  { label: "Creator Score", value: "78/100", trend: 4.2 },
];

export const sparklineData = {
  followers: [18, 20, 19, 22, 24, 23, 25, 28, 27, 30, 32, 35],
  engagement: [4.2, 4.5, 4.1, 4.8, 5.0, 4.9, 5.2, 5.4, 5.1, 5.6, 5.3, 5.4],
  reach: [650, 720, 680, 750, 810, 790, 830, 870, 850, 900, 880, 892],
};

export const recommendations = [
  {
    id: 1,
    title: "Post more carousels this week",
    description: "Your carousel engagement is 2.4x higher than images. Try 3-4 carousels this week.",
    priority: "high" as const,
  },
  {
    id: 2,
    title: "Engage with your top commenters",
    description: "Reply to your top 10 commenters within 1 hour to boost community engagement.",
    priority: "medium" as const,
  },
  {
    id: 3,
    title: "Refresh your hashtag set",
    description: "Your hashtags haven't been updated in 45 days. Rotate for better explore reach.",
    priority: "medium" as const,
  },
  {
    id: 4,
    title: "Schedule weekend content",
    description: "You're missing 40% of weekend engagement. Pre-schedule 2 posts for Saturday.",
    priority: "low" as const,
  },
];

export const quickActions = [
  { label: "Run Audit", href: "/audit" },
  { label: "Create Content", href: "/content" },
  { label: "View Analytics", href: "/analytics" },
  { label: "Check AI Insights", href: "/ai-insights" },
];
