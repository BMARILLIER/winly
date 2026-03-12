"use client";

import { useActionState } from "react";
import { updateWorkspace, type WorkspaceState } from "@/lib/actions/workspace";
import {
  PROFILE_TYPES,
  PLATFORMS,
  GOALS,
  POST_FREQUENCIES,
} from "@/lib/workspace-constants";

interface WorkspaceProps {
  workspace: {
    id: string;
    name: string;
    profileType: string;
    mainPlatform: string;
    niche: string;
    goals: string;
    postFrequency: string;
  };
}

export function WorkspaceSettingsForm({ workspace }: WorkspaceProps) {
  const parsedGoals: string[] = JSON.parse(workspace.goals);

  const [state, action, pending] = useActionState<WorkspaceState, FormData>(
    updateWorkspace,
    null
  );

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="workspaceId" value={workspace.id} />

      {state?.error && (
        <div className="rounded-lg bg-danger/15 p-4 text-sm text-danger">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="rounded-lg bg-success/15 p-4 text-sm text-success">
          Workspace mis à jour.
        </div>
      )}

      {/* Workspace name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Nom du workspace
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={workspace.name}
          className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Profile type */}
      <div>
        <label htmlFor="profileType" className="block text-sm font-medium text-foreground">
          Type de profil
        </label>
        <select
          id="profileType"
          name="profileType"
          required
          defaultValue={workspace.profileType}
          className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {PROFILE_TYPES.map((pt) => (
            <option key={pt.id} value={pt.id}>
              {pt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Main platform */}
      <div>
        <label htmlFor="mainPlatform" className="block text-sm font-medium text-foreground">
          Plateforme principale
        </label>
        <select
          id="mainPlatform"
          name="mainPlatform"
          required
          defaultValue={workspace.mainPlatform}
          className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {PLATFORMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Niche */}
      <div>
        <label htmlFor="niche" className="block text-sm font-medium text-foreground">
          Votre niche
        </label>
        <input
          id="niche"
          name="niche"
          type="text"
          required
          defaultValue={workspace.niche}
          className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Goals */}
      <fieldset>
        <legend className="block text-sm font-medium text-foreground">
          Vos objectifs
        </legend>
        <div className="mt-2 space-y-2">
          {GOALS.map((goal) => (
            <label
              key={goal.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-surface-2 cursor-pointer"
            >
              <input
                type="checkbox"
                name="goals"
                value={goal.id}
                defaultChecked={parsedGoals.includes(goal.id)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-sm text-foreground">{goal.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Post frequency */}
      <div>
        <label htmlFor="postFrequency" className="block text-sm font-medium text-foreground">
          Fréquence de publication
        </label>
        <select
          id="postFrequency"
          name="postFrequency"
          required
          defaultValue={workspace.postFrequency}
          className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {POST_FREQUENCIES.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
