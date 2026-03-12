import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ScoreReport } from "@/modules/score";

function color(score: number) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-danger";
}

function bg(score: number) {
  if (score >= 70) return "bg-success";
  if (score >= 40) return "bg-warning";
  return "bg-danger";
}

function ring(score: number) {
  if (score >= 70) return "stroke-[#22c55e]";
  if (score >= 40) return "stroke-[#f59e0b]";
  return "stroke-[#ef4444]";
}

function label(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Bien";
  if (score >= 40) return "Moyen";
  if (score >= 20) return "À améliorer";
  return "Critique";
}

export default async function ScoreResultsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const latest = await prisma.scoreResult.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) redirect("/score");

  const report: ScoreReport = JSON.parse(latest.details);

  // Sort pillars by score ascending (weakest first)
  const sorted = [...report.pillars].sort((a, b) => a.score - b.score);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Winly Score</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Votre score sur les 5 piliers clés du social growth.
        </p>
      </div>

      {/* Global score card */}
      <div className="mb-8 rounded-xl border border-border bg-surface-1 p-8 transition-all duration-200 hover:border-border-hover shadow-sm-dark">
        <div className="flex items-center gap-8">
          {/* Ring */}
          <div className="relative h-36 w-36 shrink-0">
            <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="52"
                fill="none" stroke="#e5e7eb" strokeWidth="10"
              />
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                className={ring(report.globalScore)}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(report.globalScore / 100) * 327} 327`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${color(report.globalScore)}`}>
                {report.globalScore}
              </span>
              <span className="text-xs text-text-muted">/100</span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">
              {label(report.globalScore)}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {report.globalScore >= 70
                ? "Vous avez des bases solides. Concentrez-vous sur vos piliers les plus faibles pour continuer à progresser."
                : report.globalScore >= 40
                  ? "Base solide avec de la marge d'amélioration. Consultez le détail des piliers ci-dessous."
                  : "Il y a beaucoup de potentiel. Commencez par la priorité ci-dessous."}
            </p>
          </div>
        </div>
      </div>

      {/* Pillar radar — horizontal bars */}
      <div className="mb-8 rounded-xl border border-border bg-surface-1 p-6 transition-all duration-200 hover:border-border-hover shadow-sm-dark">
        <h3 className="text-sm font-medium text-text-secondary mb-4">Détail par pilier</h3>
        <div className="space-y-4">
          {report.pillars.map((p) => (
            <div key={p.pillarId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">
                  {p.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">
                    {Math.round(p.weight * 100)}%
                  </span>
                  <span className={`text-sm font-bold ${color(p.score)}`}>
                    {p.score}
                  </span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-3">
                <div
                  className={`h-2 rounded-full ${bg(p.score)} transition-all`}
                  style={{ width: `${p.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advice by priority (weakest first) */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary">
          Recommandations (du plus faible au plus fort)
        </h3>
        {sorted.map((p, i) => (
          <div key={p.pillarId} className="rounded-xl border border-border bg-surface-1 p-5 transition-all duration-200 hover:border-border-hover shadow-sm-dark">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${bg(p.score)}`}
              >
                {i + 1}
              </div>
              <h4 className="font-semibold text-foreground">{p.label}</h4>
              <span className={`ml-auto text-sm font-bold ${color(p.score)}`}>
                {p.score}/100
              </span>
            </div>
            <p className="text-sm text-text-secondary">{p.advice}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/score"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Refaire l&apos;évaluation
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-foreground"
        >
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
