"use client";

import { useState, useActionState } from "react";
import { createContentIdea, type ContentState } from "@/lib/actions/content";
import { FORMATS } from "@/modules/content";

export function NewIdeaForm({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ContentState, FormData>(
    async (prev, formData) => {
      const result = await createContentIdea(prev, formData);
      if (result?.success) setOpen(false);
      return result;
    },
    null
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-border bg-surface-1 p-6 text-sm font-medium text-text-secondary hover:border-accent/50 hover:text-accent transition-colors"
      >
        + New content idea
      </button>
    );
  }

  return (
    <form action={action} className="rounded-xl border border-border bg-surface-1 p-6 space-y-4 transition-all duration-200 hover:border-border-hover">
      <input type="hidden" name="workspaceId" value={workspaceId} />

      {state?.error && (
        <div className="rounded-lg bg-danger/15 p-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="What's the idea?"
          className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label htmlFor="hook" className="block text-sm font-medium text-foreground">
          Hook
        </label>
        <input
          id="hook"
          name="hook"
          type="text"
          placeholder="Opening line to grab attention"
          className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label htmlFor="format" className="block text-sm font-medium text-foreground">
          Format
        </label>
        <select
          id="format"
          name="format"
          required
          className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">Select format</option>
          {FORMATS.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="caption" className="block text-sm font-medium text-foreground">
          Caption
        </label>
        <textarea
          id="caption"
          name="caption"
          rows={3}
          placeholder="Write the caption or body text"
          className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label htmlFor="cta" className="block text-sm font-medium text-foreground">
          Call to Action
        </label>
        <input
          id="cta"
          name="cta"
          type="text"
          placeholder='e.g. "Save this post" or "Link in bio"'
          className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save idea"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
