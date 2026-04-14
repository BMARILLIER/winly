"use client";

import { useState } from "react";
import { generatePersona, type Persona } from "@/modules/persona-engine";
import { savePersona } from "@/lib/actions/persona";
import {
  UserCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Check,
  Plane,
  DollarSign,
  Laugh,
  Dumbbell,
  Shirt,
  Gamepad2,
  UtensilsCrossed,
  Heart,
} from "lucide-react";

// ─── Step data ───

const NICHES = [
  { value: "voyage", label: "Voyage", icon: Plane },
  { value: "finance", label: "Finance", icon: DollarSign },
  { value: "humour", label: "Humour", icon: Laugh },
  { value: "fitness", label: "Fitness", icon: Dumbbell },
  { value: "mode", label: "Mode", icon: Shirt },
  { value: "gaming", label: "Gaming", icon: Gamepad2 },
  { value: "food", label: "Food", icon: UtensilsCrossed },
  { value: "lifestyle", label: "Lifestyle", icon: Heart },
];

const TONES = [
  { value: "inspirant", label: "Inspirant" },
  { value: "éducatif", label: "Éducatif" },
  { value: "drôle", label: "Drôle" },
  { value: "provocateur", label: "Provocateur" },
];

const PLATFORMS = [
  { value: "instagram" as const, label: "Instagram" },
  { value: "tiktok" as const, label: "TikTok" },
  { value: "les_deux" as const, label: "Les deux" },
];

// ─── Component ───

export function PersonaForm() {
  const [step, setStep] = useState(1);
  const [niche, setNiche] = useState("");
  const [tone, setTone] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "tiktok" | "les_deux">("instagram");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);

  const canAdvance =
    (step === 1 && niche !== "") ||
    (step === 2 && tone !== "") ||
    (step === 3);

  function next() {
    if (canAdvance && step < 3) setStep(step + 1);
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  async function handleGenerate() {
    if (!niche || !tone) return;

    setLoading(true);
    setError(null);

    const result = await generatePersona({ niche, tone, platform });

    setLoading(false);

    if (result.ok && result.persona) {
      setPersona(result.persona);
    } else {
      setError(result.error || "Erreur inattendue.");
    }
  }

  async function handleRegenerate() {
    setPersona(null);
    await handleGenerate();
  }

  async function handleSave() {
    if (!persona) return;
    setSaving(true);
    setError(null);

    const result = await savePersona(persona);

    setSaving(false);

    if (result.ok) {
      setSaved(true);
    } else {
      setError(result.error || "Erreur lors de la sauvegarde.");
    }
  }

  function handleReset() {
    setStep(1);
    setNiche("");
    setTone("");
    setPlatform("instagram");
    setPersona(null);
    setSaved(false);
    setError(null);
  }

  // ─── Result screen ───
  if (persona) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-surface-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-violet flex items-center justify-center shrink-0">
              <UserCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {persona.name}
              </h2>
              <p className="text-sm text-text-muted">
                {persona.niche} · {persona.tone} · {persona.platform === "les_deux" ? "Instagram + TikTok" : persona.platform}
              </p>
            </div>
          </div>

          {/* Fields */}
          <div className="grid gap-5 sm:grid-cols-2">
            <ResultField label="Bio" value={persona.bio} />
            <ResultField label="Catchphrase" value={persona.catchphrase} />
            <ResultField
              label="Style visuel"
              value={persona.visual_style}
              className="sm:col-span-2"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="flex-1 rounded-xl border border-border px-6 py-3 font-semibold text-text-secondary hover:bg-surface-2 hover:text-foreground hover:border-border-hover transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Régénérer
          </button>
          {saved ? (
            <button
              onClick={handleReset}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary to-violet px-6 py-3 font-semibold text-white hover:opacity-90 transition-all shadow-glow inline-flex items-center justify-center gap-2"
            >
              Créer un autre persona
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary to-violet px-6 py-3 font-semibold text-white hover:opacity-90 transition-all shadow-glow disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Utiliser ce persona
                </>
              )}
            </button>
          )}
        </div>

        {saved && (
          <p className="text-sm text-green-400 text-center">
            Persona sauvegardé et activé.
          </p>
        )}

        {loading && (
          <p className="text-sm text-text-muted text-center inline-flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Régénération en cours...
          </p>
        )}
      </div>
    );
  }

  // ─── Wizard ───
  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 flex items-center gap-2">
            <div
              className={`h-2 w-full rounded-full transition-all duration-300 ${
                s <= step ? "bg-accent" : "bg-surface-2"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Step 1 — Niche */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-accent uppercase tracking-wide">
              Étape 1 sur 3
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              Choisis ta niche
            </h2>
            <p className="mt-1 text-text-secondary">
              Quel univers pour ton persona anonyme ?
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {NICHES.map((n) => (
              <button
                key={n.value}
                type="button"
                onClick={() => setNiche(n.value)}
                className={`rounded-xl border p-4 text-center transition-all duration-200 ${
                  niche === n.value
                    ? "border-accent bg-accent-muted text-accent shadow-glow"
                    : "border-border bg-surface-1 text-text-secondary hover:border-border-hover hover:-translate-y-1"
                }`}
              >
                <n.icon className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">{n.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Tone */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-accent uppercase tracking-wide">
              Étape 2 sur 3
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              Choisis ton ton
            </h2>
            <p className="mt-1 text-text-secondary">
              Comment ton persona s&apos;exprime ?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {TONES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTone(t.value)}
                className={`rounded-xl border p-5 text-center text-lg font-medium transition-all duration-200 ${
                  tone === t.value
                    ? "border-accent bg-accent-muted text-accent shadow-glow"
                    : "border-border bg-surface-1 text-text-secondary hover:border-border-hover hover:-translate-y-1"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Platform */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-accent uppercase tracking-wide">
              Étape 3 sur 3
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              Choisis ta plateforme
            </h2>
            <p className="mt-1 text-text-secondary">
              Où ton persona va publier ?
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPlatform(p.value)}
                className={`rounded-xl border p-5 text-center font-medium transition-all duration-200 ${
                  platform === p.value
                    ? "border-accent bg-accent-muted text-accent shadow-glow"
                    : "border-border bg-surface-1 text-text-secondary hover:border-border-hover hover:-translate-y-1"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 1 && (
          <button
            onClick={back}
            className="rounded-xl border border-border px-6 py-3 font-semibold text-text-secondary hover:bg-surface-2 hover:text-foreground hover:border-border-hover transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
        )}

        {step < 3 ? (
          <button
            onClick={next}
            disabled={!canAdvance}
            className="flex-1 rounded-xl bg-gradient-to-r from-primary to-violet px-6 py-3 font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow inline-flex items-center justify-center gap-2"
          >
            Suivant
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 rounded-xl bg-gradient-to-r from-primary to-violet px-6 py-3 font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              "Générer mon persona"
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}

// ─── Helpers ───

function ResultField({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-lg bg-surface-2 p-4 ${className}`}>
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">
        {label}
      </p>
      <p className="text-foreground leading-relaxed">{value}</p>
    </div>
  );
}
