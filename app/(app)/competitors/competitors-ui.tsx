"use client";

import { SectionHeader, Card, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { ChartContainer, ChartTooltip, chartTheme } from "@/components/shared/chart-wrapper";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { UserPlus } from "lucide-react";
import { competitors, yourScores, radarLabels } from "@/lib/mock/competitors";

const radarData = radarLabels.map((label, i) => {
  const key = label.toLowerCase() as keyof typeof yourScores;
  const entry: Record<string, string | number> = { subject: label, You: yourScores[key] };
  competitors.forEach((c) => {
    entry[c.name] = c.scores[key];
  });
  return entry;
});

export function CompetitorsUI() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Radar concurrentiel</CardTitle>
        </CardHeader>
        <ChartContainer height={380}>
          <RadarChart data={radarData}>
            <PolarGrid stroke={chartTheme.gridColor} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: chartTheme.axisColor, fontSize: 12 }} />
            <Radar name="You" dataKey="You" stroke={chartTheme.palette[0]} fill={chartTheme.palette[0]} fillOpacity={0.2} strokeWidth={2} />
            {competitors.slice(0, 2).map((c, i) => (
              <Radar
                key={c.id}
                name={c.name}
                dataKey={c.name}
                stroke={chartTheme.palette[i + 1]}
                fill={chartTheme.palette[i + 1]}
                fillOpacity={0.05}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            ))}
            <ChartTooltip />
          </RadarChart>
        </ChartContainer>
      </Card>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 px-4 text-left font-medium text-text-secondary">Créateur</th>
              <th className="py-3 px-4 text-left font-medium text-text-secondary">Abonnés</th>
              <th className="py-3 px-4 text-left font-medium text-text-secondary">Engagement</th>
              <th className="py-3 px-4 text-left font-medium text-text-secondary">Fréquence</th>
              <th className="py-3 px-4 text-left font-medium text-text-secondary">Format principal</th>
              <th className="py-3 px-4 text-left font-medium text-text-secondary">Croissance</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border bg-accent-muted">
              <td className="py-3 px-4">
                <span className="font-medium text-accent">Vous</span>
              </td>
              <td className="py-3 px-4 text-foreground">24.8K</td>
              <td className="py-3 px-4 text-foreground">5.4%</td>
              <td className="py-3 px-4 text-foreground">4x/week</td>
              <td className="py-3 px-4 text-foreground">Carousels</td>
              <td className="py-3 px-4">
                <Badge variant="success">+12.3%</Badge>
              </td>
            </tr>
            {competitors.map((c) => (
              <tr key={c.id} className="border-b border-border hover:bg-surface-2 transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-text-muted">{c.handle}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-text-secondary">{c.followers}</td>
                <td className="py-3 px-4 text-text-secondary">{c.engagementRate}%</td>
                <td className="py-3 px-4 text-text-secondary">{c.postFrequency}</td>
                <td className="py-3 px-4 text-text-secondary">{c.topFormat}</td>
                <td className="py-3 px-4">
                  <Badge variant={c.growthRate > 10 ? "success" : "default"}>+{c.growthRate}%</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {competitors.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{c.name}</h3>
                <p className="text-xs text-text-muted">{c.handle}</p>
              </div>
              <Badge variant={c.growthRate > 10 ? "success" : "default"}>+{c.growthRate}%</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-text-muted">Abonnés</p>
                <p className="text-sm font-medium text-foreground">{c.followers}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Engagement</p>
                <p className="text-sm font-medium text-foreground">{c.engagementRate}%</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Fréquence</p>
                <p className="text-sm font-medium text-foreground">{c.postFrequency}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
