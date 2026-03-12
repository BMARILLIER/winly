"use client";

import { useState } from "react";
import { runCreatorScoreSandbox, runTrendRadarSandbox } from "@/lib/actions/admin-sandbox";

type SandboxResult = {
  engine: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: any;
  result: unknown;
  durationMs: number;
} | null;

export function SandboxUI() {
  const [activeTab, setActiveTab] = useState<"creator-score" | "trend-radar">("creator-score");
  const [lastResult, setLastResult] = useState<SandboxResult>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreatorScore(formData: FormData) {
    setLoading(true);
    try {
      const res = await runCreatorScoreSandbox(formData);
      setLastResult({ engine: "creator-score", ...res });
    } finally {
      setLoading(false);
    }
  }

  async function handleTrendRadar(formData: FormData) {
    setLoading(true);
    try {
      const res = await runTrendRadarSandbox(formData);
      setLastResult({ engine: "trend-radar", ...res });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab("creator-score")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            activeTab === "creator-score"
              ? "bg-accent-muted text-accent"
              : "bg-surface-2 text-text-secondary hover:bg-surface-3"
          }`}
        >
          Creator Score
        </button>
        <button
          onClick={() => setActiveTab("trend-radar")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            activeTab === "trend-radar"
              ? "bg-accent-muted text-accent"
              : "bg-surface-2 text-text-secondary hover:bg-surface-3"
          }`}
        >
          Trend Radar
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input form */}
        <div className="rounded-lg border bg-surface-1 p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Paramètres d&apos;entrée</h3>

          {activeTab === "creator-score" ? (
            <form action={handleCreatorScore} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field name="totalContent" label="Contenu total" defaultValue="10" />
                <Field name="publishedContent" label="Publié" defaultValue="5" />
                <Field name="draftContent" label="Brouillons" defaultValue="2" />
                <Field name="readyContent" label="Prêt" defaultValue="3" />
                <Field name="scheduledContent" label="Planifié" defaultValue="2" />
                <Field name="savedHooks" label="Hooks sauvés" defaultValue="3" />
                <Field name="socialProfileCount" label="Profils sociaux" defaultValue="1" />
                <Field name="completedMissions" label="Missions" defaultValue="0" />
                <Field name="totalXp" label="XP total" defaultValue="0" />
                <Field name="latestAuditScore" label="Score audit" defaultValue="" placeholder="null" />
                <Field name="latestWinlyScore" label="Winly Score" defaultValue="" placeholder="null" />
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">Post Frequency</label>
                  <select name="postFrequency" defaultValue="weekly" className="w-full rounded border px-2 py-1.5 text-sm">
                    <option value="daily">Daily</option>
                    <option value="few_per_week">Few/week</option>
                    <option value="weekly">Weekly</option>
                    <option value="few_per_month">Few/month</option>
                    <option value="irregular">Irregular</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-accent py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
              >
                {loading ? "Calcul en cours..." : "Lancer Creator Score"}
              </button>
            </form>
          ) : (
            <form action={handleTrendRadar} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">Niche</label>
                  <select name="niche" defaultValue="tech" className="w-full rounded border px-2 py-1.5 text-sm">
                    <option value="fitness">Fitness</option>
                    <option value="tech">Tech</option>
                    <option value="food">Food</option>
                    <option value="business">Business</option>
                    <option value="other">Autre (universel)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">Plateforme</label>
                  <select name="platform" defaultValue="instagram" className="w-full rounded border px-2 py-1.5 text-sm">
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">Fréquence de publication</label>
                  <select name="postFrequency" defaultValue="weekly" className="w-full rounded border px-2 py-1.5 text-sm">
                    <option value="daily">Quotidien</option>
                    <option value="few_per_week">Quelques/semaine</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="few_per_month">Quelques/mois</option>
                    <option value="irregular">Irrégulier</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-accent py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
              >
                {loading ? "Calcul en cours..." : "Lancer Trend Radar"}
              </button>
            </form>
          )}
        </div>

        {/* Result */}
        <div className="rounded-lg border bg-surface-1 p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Résultat</h3>
          {lastResult ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-accent-muted px-2 py-0.5 text-xs font-medium text-accent">
                  {lastResult.engine}
                </span>
                <span className="text-xs text-text-secondary">{lastResult.durationMs}ms</span>
              </div>
              <pre className="max-h-96 overflow-auto rounded-lg bg-surface-2 p-4 text-xs text-foreground">
                {JSON.stringify(lastResult.result, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-text-muted">
              Lancez un moteur pour voir les résultats ici.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-text-secondary">{label}</label>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded border px-2 py-1.5 text-sm"
      />
    </div>
  );
}
