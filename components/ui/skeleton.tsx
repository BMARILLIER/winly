import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-surface-2", className)}
      {...props}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface-1 p-6", className)}>
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-4" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonList({
  rows = 5,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-border bg-surface-1 p-4"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton
              className="h-4"
              style={{ width: `${60 + ((i * 17) % 30)}%` }}
            />
            <Skeleton
              className="h-3"
              style={{ width: `${35 + ((i * 13) % 25)}%` }}
            />
          </div>
          <Skeleton className="h-6 w-16 shrink-0 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface-1 p-6", className)}>
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="flex items-end gap-2 h-40">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ height: `${30 + ((i * 37 + 13) % 70)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  const widths = [92, 78, 85, 60, 70, 88, 55, 95];
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5"
          style={{ width: `${widths[i % widths.length]}%` }}
        />
      ))}
    </div>
  );
}
