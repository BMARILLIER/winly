"use client";

import { useState } from "react";
import {
  generatePersonaContent,
  type GeneratedContent,
} from "@/lib/actions/persona-content";
import {
  Loader2,
  RefreshCw,
  Copy,
  Check,
  AlignLeft,
  Layers,
  Video,
  CircleDot,
} from "lucide-react";

const FORMATS = [
  { value: "caption", label: "Caption", icon: AlignLeft },
  { value: "carrousel", label: "Carrousel", icon: Layers },
  { value: "reel", label: "Reel / TikTok", icon: Video },
  { value: "story", label: "Story", icon: CircleDot },
];

export function ContenuForm({ personaId }: { personaId: string }) {
  const [subject, setSubject] = useState("");
  const [format, setFormat] = useState("caption");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleGenerate() {
    if (!subject.trim()) return;

    setLoading(true);
    setError(null);

    const result = await generatePersonaContent(personaId, subject, format);

    setLoading(false);

    if (result.ok && result.content) {
      setContent(result.content);
    } else {
      setError(result.error || "Erreur inattendue.");
    }
  }

  async function handleCopy(field: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  }

  function fullText(): string {
    if (!content) return "";
    const hashtags = content.hashtags.map((h) => `#${h}`).join(" ");
    return `${content.hook}\n\n${content.body}\n\n${content.cta}\n\n${hashtags}`;
  }

  return (
    <div className="space-y-6">
      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Sujet du post
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Ex: Les 3 erreurs que font tous les débutants en bourse"
          className="w-full rounded-xl border border-border bg-surface-1 px-4 py-3 text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) handleGenerate();
          }}
        />
      </div>

      {/* Format */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Format
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFormat(f.value)}
              className={`rounded-xl border p-4 text-center transition-all duration-200 ${
                format === f.value
                  ? "border-accent bg-accent-muted text-accent shadow-glow"
                  : "border-border bg-surface-1 text-text-secondary hover:border-border-hover hover:-translate-y-1"
              }`}
            >
              <f.icon className="h-5 w-5 mx-auto mb-1.5" />
              <span className="text-sm font-medium">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !subject.trim()}
        className="w-full rounded-xl bg-gradient-to-r from-primary to-violet px-6 py-3 font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow inline-flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Génération en cours...
          </>
        ) : (
          "Générer le contenu"
        )}
      </button>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      {/* Result */}
      {content && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              Contenu généré
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy("all", fullText())}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:text-foreground hover:border-border-hover transition-all inline-flex items-center gap-1.5"
              >
                {copied === "all" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-400" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Tout copier
                  </>
                )}
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:text-foreground hover:border-border-hover transition-all inline-flex items-center gap-1.5"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                />
                Régénérer
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-1 divide-y divide-border">
            {/* Hook */}
            <ContentBlock
              label="Hook"
              text={content.hook}
              copied={copied === "hook"}
              onCopy={() => handleCopy("hook", content.hook)}
            />

            {/* Body */}
            <ContentBlock
              label="Corps"
              text={content.body}
              copied={copied === "body"}
              onCopy={() => handleCopy("body", content.body)}
              multiline
            />

            {/* CTA */}
            <ContentBlock
              label="Call to action"
              text={content.cta}
              copied={copied === "cta"}
              onCopy={() => handleCopy("cta", content.cta)}
            />

            {/* Hashtags */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                  Hashtags
                </p>
                <button
                  onClick={() =>
                    handleCopy(
                      "hashtags",
                      content.hashtags.map((h) => `#${h}`).join(" "),
                    )
                  }
                  className="text-text-muted hover:text-foreground transition-colors"
                >
                  {copied === "hashtags" ? (
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {content.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-accent-muted px-3 py-1 text-sm text-accent"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentBlock({
  label,
  text,
  copied,
  onCopy,
  multiline = false,
}: {
  label: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
  multiline?: boolean;
}) {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
          {label}
        </p>
        <button
          onClick={onCopy}
          className="text-text-muted hover:text-foreground transition-colors"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <p
        className={`text-foreground leading-relaxed ${
          multiline ? "whitespace-pre-line" : ""
        }`}
      >
        {text}
      </p>
    </div>
  );
}
