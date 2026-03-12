export default function HashtagsLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-7 w-64 rounded-lg bg-surface-2 animate-pulse" />
        <div className="mt-2 h-4 w-80 rounded-lg bg-surface-2 animate-pulse" />
      </div>

      {/* Input skeleton */}
      <div className="rounded-xl border border-border bg-surface-1 p-6">
        <div className="h-4 w-48 rounded bg-surface-2 animate-pulse mb-2" />
        <div className="h-11 w-full rounded-lg bg-surface-2 animate-pulse" />
        <div className="mt-4 h-3 w-20 rounded bg-surface-2 animate-pulse mb-2" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 rounded-full bg-surface-2 animate-pulse"
            />
          ))}
        </div>
        <div className="mt-5 h-11 w-full rounded-lg bg-surface-2 animate-pulse" />
      </div>

      {/* Results skeleton */}
      <div className="mt-6 rounded-xl border border-border bg-surface-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-72 rounded bg-surface-2 animate-pulse" />
          <div className="h-9 w-28 rounded-lg bg-surface-2 animate-pulse" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-full bg-surface-2 animate-pulse"
              style={{ width: `${80 + (i % 3) * 30}px` }}
            />
          ))}
        </div>
      </div>

      {/* Category skeletons */}
      {Array.from({ length: 3 }).map((_, g) => (
        <div
          key={g}
          className="mt-4 rounded-xl border border-border bg-surface-1 p-5"
        >
          <div className="h-4 w-40 rounded bg-surface-2 animate-pulse mb-3" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 + g * 2 }).map((_, i) => (
              <div
                key={i}
                className="h-9 rounded-full bg-surface-2 animate-pulse"
                style={{ width: `${70 + (i % 4) * 25}px` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
