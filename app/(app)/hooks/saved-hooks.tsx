"use client";

import { deleteHook } from "@/lib/actions/hooks";
import { HOOK_TYPES } from "@/modules/hooks";

interface SavedHook {
  id: string;
  text: string;
  type: string;
  createdAt: Date;
}

export function SavedHooks({ hooks }: { hooks: SavedHook[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
        Saved hooks ({hooks.length})
      </h2>

      {hooks.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-1 p-8 text-center transition-all duration-200 hover:border-border-hover">
          <p className="text-sm text-text-muted">
            No saved hooks yet. Generate some and save the ones you like.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {hooks.map((hook) => {
            const typeInfo = HOOK_TYPES.find((t) => t.id === hook.type);

            return (
              <div key={hook.id} className="rounded-xl border border-border bg-surface-1 p-4 transition-all duration-200 hover:border-border-hover">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground flex-1">{hook.text}</p>
                  <form action={deleteHook}>
                    <input type="hidden" name="hookId" value={hook.id} />
                    <button
                      type="submit"
                      className="shrink-0 rounded p-1 text-text-muted hover:text-danger"
                      title="Remove"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </form>
                </div>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo?.color ?? "bg-surface-2 text-text-secondary"}`}
                >
                  {typeInfo?.label ?? hook.type}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
