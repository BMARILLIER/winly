"use client";

import { deleteWorkspace } from "@/lib/actions/admin";

export function DeleteButton({ workspaceId }: { workspaceId: string }) {
  return (
    <form action={deleteWorkspace}>
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <button
        type="submit"
        className="rounded border border-danger/30 px-2 py-1 text-xs text-danger hover:bg-danger/15"
        onClick={(e) => {
          if (!confirm("Supprimer ce workspace et tout son contenu ?")) {
            e.preventDefault();
          }
        }}
      >
        Supprimer
      </button>
    </form>
  );
}
