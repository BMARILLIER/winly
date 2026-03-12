import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; positive?: boolean };
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ label, value, trend, icon: Icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface-1 p-5 transition-all duration-200 hover:border-border-hover",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        </div>
        {Icon && (
          <div className="rounded-lg bg-accent-muted p-2">
            <Icon className="h-5 w-5 text-accent" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={cn(
              "text-sm font-medium",
              trend.positive !== false && trend.value > 0
                ? "text-success"
                : trend.value < 0
                ? "text-danger"
                : "text-text-muted"
            )}
          >
            {trend.value > 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-xs text-text-muted">vs last period</span>
        </div>
      )}
    </div>
  );
}
