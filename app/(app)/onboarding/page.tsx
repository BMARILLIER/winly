"use client";

import { useState, useActionState } from "react";
import { createWorkspace, type WorkspaceState } from "@/lib/actions/workspace";
import {
  PROFILE_TYPES,
  PLATFORMS,
  GOALS,
  POST_FREQUENCIES,
} from "@/lib/workspace-constants";

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [profileType, setProfileType] = useState("");
  const [mainPlatform, setMainPlatform] = useState("");
  const [niche, setNiche] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [postFrequency, setPostFrequency] = useState("");
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState("");

  const [state, formAction, pending] = useActionState<WorkspaceState, FormData>(
    createWorkspace,
    null
  );

  function next() {
    setLocalError("");

    if (step === 1 && !profileType) {
      setLocalError("Veuillez sélectionner un type de profil.");
      return;
    }
    if (step === 2 && !mainPlatform) {
      setLocalError("Veuillez sélectionner une plateforme.");
      return;
    }
    if (step === 3 && !niche.trim()) {
      setLocalError("Veuillez entrer votre niche.");
      return;
    }
    if (step === 4 && goals.length === 0) {
      setLocalError("Veuillez sélectionner au moins un objectif.");
      return;
    }

    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function back() {
    setLocalError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  function toggleGoal(id: string) {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  const error = localError || state?.error || "";

  const stepLabels = ["Profil", "Plateforme", "Niche", "Objectifs", "Fréquence"];

  return (
    <div className="mx-auto max-w-xl">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
          <span>Étape {step}/{TOTAL_STEPS} — {stepLabels[step - 1]}</span>
          <span className="text-xs text-text-muted">~2 min</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-3">
          <div
            className="h-1.5 rounded-full bg-accent transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {stepLabels.map((label, i) => (
            <span
              key={label}
              className={`text-[10px] ${
                i + 1 <= step ? "text-accent font-medium" : "text-text-muted"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-danger/15 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Step 1: Profile type */}
      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quel type de profil êtes-vous ?
          </h1>
          <p className="mt-2 text-text-secondary">
            Cela nous aide à personnaliser votre expérience. Aucune photo requise.
          </p>
          <div className="mt-6 space-y-3">
            {PROFILE_TYPES.map((pt) => (
              <button
                key={pt.id}
                type="button"
                onClick={() => setProfileType(pt.id)}
                className={`w-full rounded-xl border-2 p-4 text-left transition-colors ${
                  profileType === pt.id
                    ? "border-accent bg-accent-muted"
                    : "border-border hover:border-border-hover"
                }`}
              >
                <span className="font-medium text-foreground">{pt.label}</span>
                <span className="mt-1 block text-sm text-text-secondary">
                  {pt.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Platform */}
      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quelle est votre plateforme principale ?
          </h1>
          <p className="mt-2 text-text-secondary">
            Choisissez celle sur laquelle vous voulez vous concentrer. Vous pourrez en ajouter d&apos;autres plus tard.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setMainPlatform(p.id)}
                className={`rounded-xl border-2 p-4 text-center font-medium transition-colors ${
                  mainPlatform === p.id
                    ? "border-accent bg-accent-muted text-accent"
                    : "border-border text-foreground hover:border-border-hover"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Niche */}
      {step === 3 && (
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quelle est votre niche ?
          </h1>
          <p className="mt-2 text-text-secondary">
            Décrivez votre domaine de contenu en quelques mots.
          </p>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="ex. fitness, tech, cuisine, mode"
            className="mt-6 block w-full rounded-lg border border-border px-4 py-3 text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            autoFocus
          />
        </div>
      )}

      {/* Step 4: Goals */}
      {step === 4 && (
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quels sont vos objectifs ?
          </h1>
          <p className="mt-2 text-text-secondary">
            Sélectionnez tout ce qui s&apos;applique.
          </p>
          <div className="mt-6 space-y-3">
            {GOALS.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => toggleGoal(goal.id)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                  goals.includes(goal.id)
                    ? "border-accent bg-accent-muted"
                    : "border-border hover:border-border-hover"
                }`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                    goals.includes(goal.id)
                      ? "border-accent bg-accent"
                      : "border-border"
                  }`}
                >
                  {goals.includes(goal.id) && (
                    <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-foreground">{goal.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Frequency + Name → Submit */}
      {step === 5 && (
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Presque terminé !
          </h1>
          <p className="mt-2 text-text-secondary">
            À quelle fréquence comptez-vous publier, et donnez un nom à votre workspace.
          </p>

          <div className="mt-6 space-y-6">
            {/* Post frequency */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                Fréquence de publication
              </label>
              {POST_FREQUENCIES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPostFrequency(f.id)}
                  className={`w-full rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-colors ${
                    postFrequency === f.id
                      ? "border-accent bg-accent-muted text-accent"
                      : "border-border text-foreground hover:border-border-hover"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Workspace name */}
            <div>
              <label htmlFor="ws-name" className="block text-sm font-medium text-foreground">
                Nom du workspace
              </label>
              <input
                id="ws-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={profileType === "anonymous" ? "ex. Ma chaîne secrète" : "ex. Ma marque"}
                className="mt-1 block w-full rounded-lg border border-border px-4 py-3 text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={back}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-foreground"
          >
            Retour
          </button>
        ) : (
          <div />
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={next}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Continuer
          </button>
        ) : (
          <form action={formAction}>
            <input type="hidden" name="name" value={name} />
            <input type="hidden" name="profileType" value={profileType} />
            <input type="hidden" name="mainPlatform" value={mainPlatform} />
            <input type="hidden" name="niche" value={niche} />
            <input type="hidden" name="postFrequency" value={postFrequency} />
            {goals.map((g) => (
              <input key={g} type="hidden" name="goals" value={g} />
            ))}
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {pending ? "Création en cours..." : "Lancer le workspace"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
