import { cn } from "@/lib/utils";

interface GrowthPotentialBadgeProps {
  label: "High" | "Medium" | "Low";
  className?: string;
}

const styles = {
  High: "bg-success/15 text-success",
  Medium: "bg-warning/15 text-warning",
  Low: "bg-danger/15 text-danger",
};

export function GrowthPotentialBadge({ label, className }: GrowthPotentialBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", styles[label], className)}>
      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
        <path
          d={label === "Low" ? "M6 9V3M3 6l3 3 3-3" : "M6 3v6M3 6l3-3 3 3"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </span>
  );
}
