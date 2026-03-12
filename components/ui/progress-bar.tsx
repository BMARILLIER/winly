import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  gradient?: boolean;
}

export function ProgressBar({ value, max = 100, className, gradient = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("h-2 w-full rounded-full bg-surface-3", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          gradient
            ? "bg-gradient-to-r from-primary via-violet to-cyan"
            : "bg-accent"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
