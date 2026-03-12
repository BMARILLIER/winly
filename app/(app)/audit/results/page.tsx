import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { AuditReport } from "@/modules/audit";

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
  if (score >= 70) return "stroke-[#22c55e]";
  if (score >= 40) return "stroke-[#f59e0b]";
  return "stroke-[#ef4444]";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Bien";
  if (score >= 40) return "Moyen";
  if (score >= 20) return "À améliorer";
  return "Critique";
}

export default async function AuditResultsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const latest = await prisma.auditResult.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) redirect("/audit");

  const report: AuditReport = JSON.parse(latest.details);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Résultats de l&apos;audit</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Basé sur vos réponses — voici où vous en êtes.
        </p>
      </div>

      {/* Overall score */}
      <div className="mb-8 rounded-xl border border-border bg-surface-1 p-8 transition-all duration-200 hover:border-border-hover shadow-sm-dark">
        <div className="flex items-center gap-8">
          <div className="relative h-32 w-32 shrink-0">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                className={scoreRing(report.overallScore)}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(report.overallScore / 100) * 327} 327`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-3xl font-bold ${scoreColor(report.overallScore)}`}
              >
                {report.overallScore}
              </span>
              <span className="text-xs text-text-muted">/100</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Winly Score: {scoreLabel(report.overallScore)}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {report.overallScore >= 70
                ? "Vous êtes sur la bonne voie. Concentrez-vous sur les points ci-dessous pour continuer à progresser."
                : report.overallScore >= 40
                  ? "Il y a de la marge de progression. Consultez les conseils ci-dessous pour passer au niveau supérieur."
                  : "Construisons des bases solides. Commencez par les priorités ci-dessous."}
            </p>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="space-y-4">
        {report.categories.map((cat) => (
          <div key={cat.categoryId} className="rounded-xl border border-border bg-surface-1 p-6 transition-all duration-200 hover:border-border-hover shadow-sm-dark">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">{cat.label}</h3>
              <span
                className={`text-lg font-bold ${scoreColor(cat.score)}`}
              >
                {cat.score}
              </span>
            </div>

            {/* Score bar */}
            <div className="h-2 w-full rounded-full bg-surface-3 mb-4">
              <div
                className={`h-2 rounded-full ${scoreBg(cat.score)} transition-all`}
                style={{ width: `${cat.score}%` }}
              />
            </div>

            {/* Tips */}
            <ul className="space-y-2">
              {cat.tips.map((tip, i) => {
                const isPositive =
                  cat.score > 0 &&
                  i < Math.round((cat.score / 100) * cat.tips.length);

                return (
                  <li key={i} className="flex items-start gap-2">
                    {isPositive ? (
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-success"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M3 8l4 4 6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <circle
                          cx="8"
                          cy="8"
                          r="6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M8 5v3M8 10.5v.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                    <span className="text-sm text-foreground">{tip}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/audit"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Refaire l&apos;audit
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
