"use client";

import { useState, useActionState } from "react";
import { createContentIdea, generateContentWithAI, type ContentState } from "@/lib/actions/content";
import { FORMATS } from "@/modules/content";
import { Sparkles } from "lucide-react";

export function NewIdeaForm({ workspaceId, niche, platform }: { workspaceId: string; niche: string; platform: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [format, setFormat] = useState("");
  const [caption, setCaption] = useState("");
  const [cta, setCta] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  const [state, action, pending] = useActionState<ContentState, FormData>(
    async (prev, formData) => {
      const result = await createContentIdea(prev, formData);
      if (result?.success) {
        setOpen(false);
        setTitle("");
        setHook("");
        setFormat("");
        setCaption("");
        setCta("");
      }
      return result;
    },
    null
  );

  async function handleGenerate() {
    if (!title.trim()) {
      setAiError("Entrez d'abord un sujet / titre.");
      return;
    }
    if (!format) {
      setAiError("Sélectionnez d'abord un format.");
      return;
    }
    setGenerating(true);
    setAiError("");
    const result = await generateContentWithAI(title, format, niche, platform);
    setGenerating(false);
    if (result.ok) {
      setHook(result.hook ?? "");
      setCaption(result.caption ?? "");
      setCta(result.cta ?? "");
    } else {
      setAiError(result.error ?? "Erreur inconnue.");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-border bg-surface-1 p-6 text-sm font-medium text-text-secondary hover:border-accent/50 hover:text-accent transition-colors"
      >
        + Nouvelle idée de contenu
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

      {aiError && (
        <div className="rounded-lg bg-danger/15 p-3 text-sm text-danger">
          {aiError}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground">
          Sujet / Titre
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Comment mixer en soirée, Mon setup DJ..."
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
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">Choisir un format</option>
          {FORMATS.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* AI Generate Button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-violet px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
      >
        <Sparkles className="h-4 w-4" />
        {generating ? "Génération en cours..." : "Générer avec l'IA"}
      </button>

      <div>
        <label htmlFor="hook" className="block text-sm font-medium text-foreground">
          Hook (accroche)
        </label>
        <input
          id="hook"
          name="hook"
          type="text"
          value={hook}
          onChange={(e) => setHook(e.target.value)}
          placeholder="Phrase d'accroche pour capter l'attention"
          className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label htmlFor="caption" className="block text-sm font-medium text-foreground">
          Caption (légende)
        </label>
        <textarea
          id="caption"
          name="caption"
          rows={4}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Légende complète du post"
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
          value={cta}
          onChange={(e) => setCta(e.target.value)}
          placeholder='Ex: "Sauvegarde ce post" ou "Lien en bio"'
          className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "Enregistrement..." : "Enregistrer l'idée"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setTitle(""); setHook(""); setFormat(""); setCaption(""); setCta(""); }}
          className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:text-foreground"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
