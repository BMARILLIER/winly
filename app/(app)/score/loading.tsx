import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function ScoreLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <Skeleton className="mx-auto h-7 w-44" />
        <Skeleton className="mx-auto h-4 w-64" />
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Pillar card */}
      <div className="rounded-xl border border-border bg-surface-1 p-8 space-y-6">
        <Skeleton className="h-5 w-36" />
        <SkeletonText lines={2} />

        {/* Answer options */}
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
