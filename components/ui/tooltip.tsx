import { cn } from "@/lib/utils";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ text, children, className }: TooltipProps) {
  return (
    <div className={cn("group relative inline-block", className)}>
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-lg bg-surface-3 px-3 py-1.5 text-xs text-foreground opacity-0 shadow-md-dark transition-opacity group-hover:opacity-100 whitespace-nowrap">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-3" />
      </div>
    </div>
  );
}
