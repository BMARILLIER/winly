"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveHook } from "@/lib/actions/hooks";
import { generateHooks, HOOK_TYPES } from "@/modules/hooks";

interface Props {
  niche: string;
  workspaceId: string;
  activeType: string | null;
}

export function HookGenerator({ niche, workspaceId, activeType }: Props) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(activeType);
  const [hooks, setHooks] = useState(() =>
    generateHooks(niche, activeType, 6)
  );
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  function selectType(typeId: string | null) {
    setSelectedType(typeId);
    setHooks(generateHooks(niche, typeId, 6));
    setSavedIds(new Set());
    const url = typeId ? `/hooks?type=${typeId}` : "/hooks";
    router.replace(url, { scroll: false });
  }

  function regenerate() {
    // Shift the results by changing count to get different hooks
    const all = generateHooks(niche, selectedType, 40);
    const offset = hooks.length + savedIds.size;
    const next = all.slice(offset, offset + 6);
    setHooks(next.length > 0 ? next : all.slice(0, 6));
    setSavedIds(new Set());
  }

  function markSaved(index: number) {
    setSavedIds((prev) => new Set(prev).add(index));
  }

  return (
    <div>
      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => selectType(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            selectedType === null
              ? "bg-accent text-white"
              : "bg-surface-2 text-text-secondary hover:bg-surface-3"
          }`}
        >
          All types
        </button>
        {HOOK_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => selectType(t.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedType === t.id
                ? "bg-accent text-white"
                : `${t.color} hover:opacity-80`
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Selected type description */}
      {selectedType && (
        <p className="mb-4 text-sm text-text-secondary">
          {HOOK_TYPES.find((t) => t.id === selectedType)?.description}
        </p>
      )}

      {/* Generated hooks */}
      <div className="space-y-3">
        {hooks.map((hook, i) => {
          const typeInfo = HOOK_TYPES.find((t) => t.id === hook.type);
          const isSaved = savedIds.has(i);

          return (
            <div
              key={i}
              className="rounded-xl border border-border bg-surface-1 p-5 flex items-start justify-between gap-4 transition-all duration-200 hover:border-border-hover"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {hook.text}
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo?.color ?? "bg-surface-2 text-text-secondary"}`}
                >
                  {typeInfo?.label ?? hook.type}
                </span>
              </div>

              {isSaved ? (
                <span className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-success">
                  Saved
                </span>
              ) : (
                <form
                  action={async (formData) => {
                    await saveHook(formData);
                    markSaved(i);
                  }}
                >
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <input type="hidden" name="text" value={hook.text} />
                  <input type="hidden" name="type" value={hook.type} />
                  <button
                    type="submit"
                    className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent-muted transition-colors"
                  >
                    + Save
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      {/* Regenerate */}
      <button
        onClick={regenerate}
        className="mt-6 w-full rounded-lg border-2 border-dashed border-border py-3 text-sm font-medium text-text-secondary hover:border-accent/50 hover:text-accent transition-colors"
      >
        Generate more hooks
      </button>
    </div>
  );
}
