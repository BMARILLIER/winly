import { cn } from "@/lib/utils";
import type { TrendDirection } from "@/types";

const config: Record<TrendDirection, { bg: string; text: string; label: string; arrow: string }> = {
  rising: { bg: "bg-success/15", text: "text-success", label: "Rising", arrow: "M6 3v6M3 6l3-3 3 3" },
  stable: { bg: "bg-warning/15", text: "text-warning", label: "Stable", arrow: "M3 6h6" },
  fading: { bg: "bg-danger/15", text: "text-danger", label: "Fading", arrow: "M6 9V3M3 6l3 3 3-3" },
};

interface TrendDirectionBadgeProps {
  direction: TrendDirection;
  className?: string;
}

export function TrendDirectionBadge({ direction, className }: TrendDirectionBadgeProps) {
  const c = config[direction];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", c.bg, c.text, className)}>
      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
        <path d={c.arrow} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {c.label}
    </span>
  );
}
