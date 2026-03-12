export type ReportStatus = "ready" | "generating" | "pending";

export interface Report {
  id: number;
  title: string;
  period: string;
  status: ReportStatus;
  generatedAt?: string;
  summary: string;
  metrics: { label: string; value: string }[];
}

export const reports: Report[] = [
  {
    id: 1,
    title: "March 2026 Performance Report",
    period: "Mar 1 – Mar 9, 2026",
    status: "generating",
    summary: "Mid-month report in progress. Early data shows a 12% increase in engagement rate compared to February.",
    metrics: [
      { label: "Engagement Rate", value: "5.4%" },
      { label: "New Followers", value: "+1,230" },
      { label: "Top Post Reach", value: "45.2K" },
    ],
  },
  {
    id: 2,
    title: "February 2026 Performance Report",
    period: "Feb 1 – Feb 28, 2026",
    status: "ready",
    generatedAt: "Mar 1, 2026",
    summary: "Strong month with consistent growth. Carousels outperformed reels in saves. Engagement rate improved by 8% MoM.",
    metrics: [
      { label: "Engagement Rate", value: "4.9%" },
      { label: "New Followers", value: "+2,890" },
      { label: "Total Impressions", value: "842K" },
      { label: "Profile Visits", value: "12.4K" },
    ],
  },
  {
    id: 3,
    title: "January 2026 Performance Report",
    period: "Jan 1 – Jan 31, 2026",
    status: "ready",
    generatedAt: "Feb 1, 2026",
    summary: "New year momentum drove strong follower growth. Reels performed exceptionally well in the first two weeks.",
    metrics: [
      { label: "Engagement Rate", value: "4.5%" },
      { label: "New Followers", value: "+3,241" },
      { label: "Total Impressions", value: "756K" },
      { label: "Profile Visits", value: "10.8K" },
    ],
  },
  {
    id: 4,
    title: "Q4 2025 Quarterly Report",
    period: "Oct 1 – Dec 31, 2025",
    status: "ready",
    generatedAt: "Jan 2, 2026",
    summary: "Best quarter yet. Holiday content performed 40% above average. Follower count crossed 20K milestone.",
    metrics: [
      { label: "Avg Engagement Rate", value: "4.2%" },
      { label: "New Followers", value: "+6,780" },
      { label: "Total Impressions", value: "2.1M" },
    ],
  },
  {
    id: 5,
    title: "December 2025 Performance Report",
    period: "Dec 1 – Dec 31, 2025",
    status: "ready",
    generatedAt: "Jan 1, 2026",
    summary: "Holiday content drove peak engagement. Gift guides and year-in-review posts were top performers.",
    metrics: [
      { label: "Engagement Rate", value: "4.8%" },
      { label: "New Followers", value: "+2,450" },
      { label: "Total Impressions", value: "680K" },
    ],
  },
];
