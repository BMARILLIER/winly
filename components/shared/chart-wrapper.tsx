"use client";

import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartTooltipProps = { active?: boolean; payload?: any[]; label?: string };

export const chartTheme = {
  axisColor: "#5c6278",
  gridColor: "#1e2235",
  tooltipBg: "#1f2340",
  tooltipBorder: "#2d3352",
  palette: ["#6366f1", "#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6"],
};

export function ChartContainer({
  children,
  height = 300,
  className,
}: {
  children: React.ReactNode;
  height?: number;
  className?: string;
}) {
  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltipContent({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs"
      style={{
        background: chartTheme.tooltipBg,
        borderColor: chartTheme.tooltipBorder,
        color: "#f1f2f6",
      }}
    >
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export function ChartTooltip() {
  return <RechartsTooltip content={<CustomTooltipContent />} />;
}

export { chartTheme as theme };
