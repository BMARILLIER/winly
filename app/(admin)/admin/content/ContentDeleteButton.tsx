"use client";

import { deleteContent } from "@/lib/actions/admin";

export function ContentDeleteButton({ contentId }: { contentId: string }) {
  return (
    <form action={deleteContent}>
      <input type="hidden" name="contentId" value={contentId} />
      <button
        type="submit"
        className="rounded border border-danger/30 px-2 py-1 text-xs text-danger hover:bg-danger/15"
        onClick={(e) => {
          if (!confirm("Supprimer ce contenu ?")) {
            e.preventDefault();
          }
        }}
      >
        Supprimer
      </button>
    </form>
  );
}
