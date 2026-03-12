"use client";

import { saveGeneratedIdea } from "@/lib/actions/content";
import type { GeneratedIdea } from "@/modules/content";
import { FORMATS } from "@/modules/content";

interface Props {
  suggestions: GeneratedIdea[];
  workspaceId: string;
}

export function Suggestions({ suggestions, workspaceId }: Props) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
        Suggested ideas
      </h2>
      <div className="space-y-3">
        {suggestions.map((idea, i) => {
          const formatLabel = FORMATS.find((f) => f.id === idea.format)?.label ?? idea.format;

          return (
            <div
              key={i}
              className="rounded-xl border border-border bg-surface-1 p-4 transition-all duration-200 hover:border-border-hover"
            >
              <h3 className="text-sm font-semibold text-foreground">
                {idea.title}
              </h3>
              <p className="mt-1 text-xs text-accent italic">
                &ldquo;{idea.hook}&rdquo;
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-surface-2 px-2 py-0.5 text-xs text-text-secondary">
                  {formatLabel}
                </span>
                <form action={saveGeneratedIdea}>
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <input type="hidden" name="title" value={idea.title} />
                  <input type="hidden" name="hook" value={idea.hook} />
                  <input type="hidden" name="format" value={idea.format} />
                  <input type="hidden" name="caption" value={idea.caption} />
                  <input type="hidden" name="cta" value={idea.cta} />
                  <button
                    type="submit"
                    className="rounded-lg px-3 py-1 text-xs font-medium text-accent hover:bg-accent-muted transition-colors"
                  >
                    + Save
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-text-muted text-center">
        Based on your niche and platform
      </p>
    </div>
  );
}
