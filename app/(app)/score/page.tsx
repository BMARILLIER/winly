"use client";

import { useState, useActionState } from "react";
import { submitScore, type ScoreState } from "@/lib/actions/score";
import { SCORE_PILLARS } from "@/modules/score";

const TOTAL = SCORE_PILLARS.length;

export default function ScorePage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, formAction, pending] = useActionState<ScoreState, FormData>(
    submitScore,
    null
  );

  const pillar = SCORE_PILLARS[step];
  const isLast = step === TOTAL - 1;

  function answer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function canProceed() {
    return pillar.questions.every((q) => answers[q.id]);
  }

  function next() {
    if (canProceed() && !isLast) setStep((s) => s + 1);
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-foreground">Winly Score</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Évaluez votre présence sociale sur 5 piliers clés.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8 mt-6">
        <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
          <span>
            {step + 1} / {TOTAL} — {pillar.label}
          </span>
          <span className="font-medium text-accent">
            {Math.round(pillar.weight * 100)}% poids
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-3">
          <div
            className="h-1.5 rounded-full bg-accent transition-all duration-300"
            style={{ width: `${((step + 1) / TOTAL) * 100}%` }}
          />
        </div>
      </div>

      {state?.error && (
        <div className="mb-6 rounded-lg bg-danger/15 p-4 text-sm text-danger">
          {state.error}
        </div>
      )}

      {/* Pillar header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">{pillar.label}</h2>
        <p className="mt-1 text-sm text-text-secondary">{pillar.description}</p>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {pillar.questions.map((q) => (
          <div key={q.id} className="rounded-xl border border-border bg-surface-1 p-5 transition-all duration-200 hover:border-border-hover shadow-sm-dark">
            <p className="text-sm font-medium text-foreground mb-3">{q.text}</p>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => answer(q.id, opt.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    answers[q.id] === opt.value
                      ? "bg-accent-muted text-accent ring-2 ring-accent"
                      : "bg-surface-2 text-text-secondary hover:bg-surface-3"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        {step > 0 ? (
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

        {isLast ? (
          <form action={formAction}>
            {Object.entries(answers).map(([key, val]) => (
              <input key={key} type="hidden" name={key} value={val} />
            ))}
            <button
              type="submit"
              disabled={!canProceed() || pending}
              className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {pending ? "Calcul en cours..." : "Obtenir mon Winly Score"}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={next}
            disabled={!canProceed()}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            Continuer
          </button>
        )}
      </div>
    </div>
  );
}
