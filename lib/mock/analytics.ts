export const engagementTimeSeries = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 2, 9);
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    engagement: Math.round(3.2 + Math.sin(i * 0.3) * 1.5 + Math.random() * 0.8),
    reach: Math.round(12000 + Math.sin(i * 0.25) * 4000 + Math.random() * 2000),
    impressions: Math.round(28000 + Math.sin(i * 0.2) * 8000 + Math.random() * 3000),
  };
});

export const topPosts = [
  { id: 1, title: "How I grew 10K followers in 30 days", type: "carousel", engagement: 8.4, reach: 45200, likes: 2340 },
  { id: 2, title: "My morning routine as a creator", type: "reel", engagement: 7.1, reach: 38900, likes: 1890 },
  { id: 3, title: "5 tools every creator needs", type: "carousel", engagement: 6.8, reach: 32100, likes: 1650 },
  { id: 4, title: "Behind the scenes of my setup", type: "image", engagement: 5.9, reach: 28400, likes: 1420 },
  { id: 5, title: "Creator economy in 2026", type: "reel", engagement: 5.3, reach: 24700, likes: 1180 },
];

export const trafficSources = [
  { source: "Explore", value: 38 },
  { source: "Hashtags", value: 24 },
  { source: "Home", value: 18 },
  { source: "Profile", value: 12 },
  { source: "Other", value: 8 },
];

export const contentPerformance = [
  { type: "Reels", engagement: 7.2, reach: 42000, posts: 12 },
  { type: "Carousels", engagement: 6.1, reach: 35000, posts: 8 },
  { type: "Images", engagement: 3.8, reach: 18000, posts: 15 },
  { type: "Stories", engagement: 4.5, reach: 22000, posts: 24 },
];

export const analyticsKPIs = {
  followers: { value: "24.8K", trend: 12.3 },
  engagementRate: { value: "5.4%", trend: 8.1 },
  impressions: { value: "892K", trend: -2.4 },
  avgLikes: { value: "1,847", trend: 15.6 },
};
