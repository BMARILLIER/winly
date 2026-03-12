"use client";

import { useState, useActionState } from "react";
import { submitAudit, type AuditState } from "@/lib/actions/audit";
import { AUDIT_CATEGORIES } from "@/modules/audit";

const TOTAL_CATEGORIES = AUDIT_CATEGORIES.length;

export default function AuditPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, formAction, pending] = useActionState<AuditState, FormData>(
    submitAudit,
    null
  );

  const category = AUDIT_CATEGORIES[step];
  const isLast = step === TOTAL_CATEGORIES - 1;

  function answer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function canProceed() {
    return category.questions.every((q) => answers[q.id]);
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
        <h1 className="text-2xl font-bold text-foreground">Audit de profil</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Répondez honnêtement — cela nous aide à vous donner les meilleures recommandations.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8 mt-6">
        <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
          <span>
            {step + 1} / {TOTAL_CATEGORIES} — {category.label}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-3">
          <div
            className="h-1.5 rounded-full bg-accent transition-all duration-300"
            style={{ width: `${((step + 1) / TOTAL_CATEGORIES) * 100}%` }}
          />
        </div>
      </div>

      {state?.error && (
        <div className="mb-6 rounded-lg bg-danger/15 p-4 text-sm text-danger">
          {state.error}
        </div>
      )}

      {/* Category header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          {category.label}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">{category.description}</p>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {category.questions.map((q) => (
          <div
            key={q.id}
            className="rounded-xl border border-border bg-surface-1 p-5 transition-all duration-200 hover:border-border-hover shadow-sm-dark"
          >
            <p className="text-sm font-medium text-foreground">{q.text}</p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => answer(q.id, "yes")}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                  answers[q.id] === "yes"
                    ? "bg-success/15 text-success ring-2 ring-success"
                    : "bg-surface-2 text-text-secondary hover:bg-surface-3"
                }`}
              >
                Oui
              </button>
              <button
                type="button"
                onClick={() => answer(q.id, "no")}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                  answers[q.id] === "no"
                    ? "bg-danger/15 text-danger ring-2 ring-danger"
                    : "bg-surface-2 text-text-secondary hover:bg-surface-3"
                }`}
              >
                Non
              </button>
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
            {/* Submit all answers as hidden fields */}
            {Object.entries(answers).map(([key, val]) => (
              <input key={key} type="hidden" name={key} value={val} />
            ))}
            <button
              type="submit"
              disabled={!canProceed() || pending}
              className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {pending ? "Analyse en cours..." : "Voir mes résultats"}
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
