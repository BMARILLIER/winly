"use client";

import { SectionHeader, StatCard, Card, CardHeader, CardTitle, Tabs } from "@/components/ui";
import { ChartContainer, ChartTooltip, chartTheme } from "@/components/shared/chart-wrapper";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, Heart, Eye, ThumbsUp } from "lucide-react";
import {
  engagementTimeSeries,
  contentPerformance,
  analyticsKPIs,
} from "@/lib/mock/analytics";

const tabs = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "engagement", label: "Engagement" },
  { id: "reach", label: "Portée" },
  { id: "content", label: "Contenu" },
];

export function AnalyticsUI() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Analytics"
        description="Suivez les performances de votre contenu et l'engagement de votre audience"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Abonnés" value={analyticsKPIs.followers.value} trend={{ value: analyticsKPIs.followers.trend }} icon={Users} />
        <StatCard label="Taux d'engagement" value={analyticsKPIs.engagementRate.value} trend={{ value: analyticsKPIs.engagementRate.trend }} icon={Heart} />
        <StatCard label="Impressions" value={analyticsKPIs.impressions.value} trend={{ value: analyticsKPIs.impressions.trend }} icon={Eye} />
        <StatCard label="Likes moyens" value={analyticsKPIs.avgLikes.value} trend={{ value: analyticsKPIs.avgLikes.trend }} icon={ThumbsUp} />
      </div>

      <Tabs tabs={tabs}>
        {(active) => (
          <div className="space-y-6">
            {(active === "overview" || active === "engagement") && (
              <Card>
                <CardHeader>
                  <CardTitle>Engagement dans le temps</CardTitle>
                </CardHeader>
                <ChartContainer height={320}>
                  <LineChart data={engagementTimeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                    <XAxis dataKey="date" stroke={chartTheme.axisColor} fontSize={12} tickLine={false} />
                    <YAxis stroke={chartTheme.axisColor} fontSize={12} tickLine={false} />
                    <ChartTooltip />
                    <Line type="monotone" dataKey="engagement" stroke={chartTheme.palette[0]} strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              </Card>
            )}

            {(active === "overview" || active === "reach") && (
              <Card>
                <CardHeader>
                  <CardTitle>Portée</CardTitle>
                </CardHeader>
                <ChartContainer height={280}>
                  <AreaChart data={engagementTimeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                    <XAxis dataKey="date" stroke={chartTheme.axisColor} fontSize={12} tickLine={false} />
                    <YAxis stroke={chartTheme.axisColor} fontSize={12} tickLine={false} />
                    <ChartTooltip />
                    <Area type="monotone" dataKey="reach" stroke={chartTheme.palette[2]} fill={chartTheme.palette[2]} fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </Card>
            )}

            {(active === "overview" || active === "content") && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance par type de contenu</CardTitle>
                </CardHeader>
                <ChartContainer height={280}>
                  <BarChart data={contentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                    <XAxis dataKey="type" stroke={chartTheme.axisColor} fontSize={12} tickLine={false} />
                    <YAxis stroke={chartTheme.axisColor} fontSize={12} tickLine={false} />
                    <ChartTooltip />
                    <Bar dataKey="engagement" fill={chartTheme.palette[1]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </Card>
            )}
          </div>
        )}
      </Tabs>
    </div>
  );
}
