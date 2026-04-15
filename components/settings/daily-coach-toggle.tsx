"use client";

import { useState, useTransition } from "react";
import { setDailyCoachEnabled } from "@/lib/actions/daily-coach";

export function DailyCoachToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      const res = await setDailyCoachEnabled(next);
      if (!res.ok) setEnabled(!next); // revert on failure
    });
  }

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Coach quotidien 🎯</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Reçois chaque matin une mission IA courte (10-30 min) basée sur tes données
            Instagram pour garder le rythme.
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={pending}
          aria-pressed={enabled}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
            enabled ? "bg-accent" : "bg-surface-3"
          } ${pending ? "opacity-50" : ""}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      {enabled && (
        <p className="mt-3 text-xs text-success">
          ✓ Activé — prochaine mission demain matin
        </p>
      )}
    </div>
  );
}
