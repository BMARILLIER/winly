export const followerGrowth = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(2026, 2, 9);
  date.setDate(date.getDate() - (89 - i));
  const base = 18500 + i * 70;
  const noise = Math.sin(i * 0.15) * 300 + Math.random() * 200;
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    followers: Math.round(base + noise),
  };
});

export const growthRates = {
  daily: { value: "+127", trend: 5.2 },
  weekly: { value: "+843", trend: 12.8 },
  monthly: { value: "+3,241", trend: 18.4 },
  projected: { value: "32K", trend: 22.1 },
};

export const demographics = [
  { age: "13-17", percentage: 8 },
  { age: "18-24", percentage: 34 },
  { age: "25-34", percentage: 38 },
  { age: "35-44", percentage: 14 },
  { age: "45+", percentage: 6 },
];

export const activityHeatmap: { day: number; hour: number; value: number }[] = [];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
for (let d = 0; d < 7; d++) {
  for (let h = 0; h < 24; h++) {
    const peak = (h >= 9 && h <= 12) || (h >= 18 && h <= 21);
    const weekend = d >= 5;
    const base = peak ? 0.6 : 0.2;
    const bonus = weekend ? 0.15 : 0;
    activityHeatmap.push({
      day: d,
      hour: h,
      value: Math.min(1, base + bonus + Math.random() * 0.3),
    });
  }
}

export const dayLabels = days;

export const weakSignals = [
  { signal: "Engagement dip on Mondays — consider shifting post schedule", impact: "medium" as const },
  { signal: "Reel views increased 34% when posted between 6-8 PM", impact: "high" as const },
  { signal: "Carousel saves are 2.4x higher than image saves", impact: "high" as const },
  { signal: "Follower growth slowing in 45+ demographic", impact: "low" as const },
];
