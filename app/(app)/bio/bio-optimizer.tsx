"use client";

import { useActionState, useState } from "react";
import { analyzeBioAction, type BioState } from "@/lib/actions/bio";
import { BIO_CRITERIA } from "@/modules/bio";

function scoreColor(score: number) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-danger";
}

function scoreBg(score: number) {
  if (score >= 70) return "bg-success";
  if (score >= 40) return "bg-warning";
  return "bg-danger";
}

function scoreRing(score: number) {
  if (score >= 70) return "stroke-success";
  if (score >= 40) return "stroke-warning";
  return "stroke-danger";
}

interface Props {
  workspaceId: string;
  profileType: string;
}

export function BioOptimizer({ workspaceId, profileType }: Props) {
  const [state, action, pending] = useActionState<BioState | null, FormData>(
    analyzeBioAction,
    null
  );
  const [copied, setCopied] = useState<number | null>(null);

  function copyBio(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div>
      {/* Input form */}
      <form action={action} className="rounded-xl border border-border bg-surface-1 p-6 transition-all duration-200 hover:border-border-hover">
        <input type="hidden" name="workspaceId" value={workspaceId} />

        <label htmlFor="bio" className="block text-sm font-medium text-foreground">
          Your current bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          required
          placeholder={
            profileType === "anonymous"
              ? "Paste your bio here (no personal info needed)"
              : "Paste your current bio here"
          }
          defaultValue={state?.analysis?.bio ?? ""}
          className="mt-2 block w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />

        {state?.error && (
          <p className="mt-2 text-sm text-danger">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "Analyzing..." : "Analyze & optimize"}
        </button>
      </form>

      {/* Results */}
      {state?.analysis && (
        <div className="mt-8 space-y-8">
          {/* Score overview */}
          <div className="rounded-xl border border-border bg-surface-1 p-6 transition-all duration-200 hover:border-border-hover">
            <div className="flex items-center gap-6">
              {/* Ring */}
              <div className="relative h-24 w-24 shrink-0">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface-3)" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    className={scoreRing(state.analysis.overallScore)}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(state.analysis.overallScore / 100) * 327} 327`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-bold ${scoreColor(state.analysis.overallScore)}`}>
                    {state.analysis.overallScore}
                  </span>
                  <span className="text-[10px] text-text-muted">/100</span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground">Bio Score</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {state.analysis.overallScore >= 70
                    ? "Your bio is solid. Check below for fine-tuning."
                    : state.analysis.overallScore >= 40
                      ? "Room for improvement. See the breakdown below."
                      : "Your bio needs work. Use one of the suggestions below."}
                </p>
              </div>
            </div>
          </div>

          {/* Criteria breakdown */}
          <div className="rounded-xl border border-border bg-surface-1 p-6 transition-all duration-200 hover:border-border-hover">
            <h3 className="text-sm font-medium text-text-secondary mb-4">Breakdown</h3>
            <div className="space-y-4">
              {state.analysis.criteria.map((c) => (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{c.label}</span>
                    <span className={`text-sm font-bold ${scoreColor(c.score)}`}>{c.score}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-3 mb-1.5">
                    <div
                      className={`h-1.5 rounded-full ${scoreBg(c.score)} transition-all`}
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-secondary">{c.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Generated bios */}
          {state.suggestions && state.suggestions.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                  3 improved bios
                </h3>
                <form action={action}>
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <input type="hidden" name="bio" value={state.analysis.bio} />
                  <input type="hidden" name="regenerate" value="1" />
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent/50 hover:bg-surface-3 transition-colors disabled:opacity-50"
                  >
                    {pending ? "Génération…" : "🔄 Régénérer (1 crédit)"}
                  </button>
                </form>
              </div>
              <div className="space-y-4">
                {state.suggestions.map((s, i) => (
                  <div key={i} className="rounded-xl border border-border bg-surface-1 p-5 transition-all duration-200 hover:border-border-hover">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-semibold text-foreground">{s.style}</span>
                        <span className="ml-2 text-xs text-text-muted">{s.description}</span>
                      </div>
                      <button
                        onClick={() => copyBio(s.text, i)}
                        className="shrink-0 rounded-lg px-3 py-1 text-xs font-medium text-accent hover:bg-accent-muted transition-colors"
                      >
                        {copied === i ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-sm text-foreground bg-surface-2 rounded-lg p-3">
                      {s.text}
                    </p>
                    <p className="mt-1.5 text-xs text-text-muted">
                      {s.text.length} characters
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
