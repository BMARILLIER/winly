"use client";

import { updateContentStatus, deleteContentIdea } from "@/lib/actions/content";
import { FORMATS, STATUSES } from "@/modules/content";

interface Idea {
  id: string;
  title: string;
  hook: string;
  format: string;
  caption: string;
  cta: string;
  status: string;
  createdAt: Date;
}

export function ContentList({ ideas }: { ideas: Idea[] }) {
  if (ideas.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface-1 p-12 text-center transition-all duration-200 hover:border-border-hover">
        <p className="text-text-muted">No content ideas yet. Create your first one above.</p>
      </div>
    );
  }

  // Group by status
  const grouped = STATUSES.map((s) => ({
    ...s,
    ideas: ideas.filter((i) => i.status === s.id),
  })).filter((g) => g.ideas.length > 0);

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.id}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${group.color}`}>
              {group.label}
            </span>
            <span className="text-xs text-text-muted">{group.ideas.length}</span>
          </div>

          <div className="space-y-3">
            {group.ideas.map((idea) => {
              const formatLabel = FORMATS.find((f) => f.id === idea.format)?.label ?? idea.format;

              return (
                <div key={idea.id} className="rounded-xl border border-border bg-surface-1 p-5 transition-all duration-200 hover:border-border-hover">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{idea.title}</h3>
                      {idea.hook && (
                        <p className="mt-1 text-sm text-accent italic">
                          &ldquo;{idea.hook}&rdquo;
                        </p>
                      )}
                      {idea.caption && (
                        <p className="mt-2 text-sm text-text-secondary line-clamp-2">
                          {idea.caption}
                        </p>
                      )}
                      {idea.cta && (
                        <p className="mt-2 text-xs font-medium text-text-secondary">
                          CTA: {idea.cta}
                        </p>
                      )}
                    </div>

                    {/* Delete */}
                    <form action={deleteContentIdea}>
                      <input type="hidden" name="ideaId" value={idea.id} />
                      <button
                        type="submit"
                        className="shrink-0 rounded p-1 text-text-muted hover:text-danger"
                        title="Delete"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </form>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                      {formatLabel}
                    </span>

                    {/* Status progression */}
                    <div className="flex gap-1">
                      {STATUSES.map((s) => (
                        <form key={s.id} action={updateContentStatus}>
                          <input type="hidden" name="ideaId" value={idea.id} />
                          <input type="hidden" name="status" value={s.id} />
                          <button
                            type="submit"
                            title={s.label}
                            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                              idea.status === s.id
                                ? s.color
                                : "text-text-muted hover:text-text-secondary"
                            }`}
                          >
                            {s.label}
                          </button>
                        </form>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
