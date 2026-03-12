import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateActionPlan } from "@/modules/action-plan";
import type { ScoreReport } from "@/modules/score";

const PRIORITY_STYLES = {
  high: { bg: "bg-danger/15", text: "text-danger", badge: "bg-danger/15 text-danger" },
  medium: { bg: "bg-warning/15", text: "text-warning", badge: "bg-warning/15 text-warning" },
  low: { bg: "bg-success/15", text: "text-success", badge: "bg-success/15 text-success" },
} as const;

const EFFORT_LABELS = {
  quick: "Gain rapide",
  medium: "Effort moyen",
  ongoing: "Habitude continue",
} as const;

export default async function ActionPlanPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  // Need a score evaluation to generate the plan
  const latestScore = await prisma.scoreResult.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!latestScore) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground">Plan d&apos;action</h1>
        <p className="mt-2 text-text-secondary">
          Votre plan personnalisé pour améliorer votre présence sociale.
        </p>
        <div className="mt-8 rounded-xl border border-border bg-surface-1 p-12 text-center transition-all duration-200 hover:border-border-hover">
          <p className="text-text-secondary mb-4">
            Complétez d&apos;abord votre évaluation Winly Score pour générer votre plan d&apos;action.
          </p>
          <Link
            href="/score"
            className="inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Passer l&apos;évaluation Score
          </Link>
        </div>
      </div>
    );
  }

  const report: ScoreReport = JSON.parse(latestScore.details);
  const plan = generateActionPlan(report.pillars);

  const highActions = plan.actions.filter((a) => a.priority === "high");
  const mediumActions = plan.actions.filter((a) => a.priority === "medium");
  const lowActions = plan.actions.filter((a) => a.priority === "low");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Plan d&apos;action</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {plan.actions.length} actions basées sur votre Winly Score — concentrez-vous sur{" "}
          <span className="font-medium text-accent">
            {plan.focusPillarLabel}
          </span>{" "}
          en priorité.
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-surface-1 p-4 text-center transition-all duration-200 hover:border-border-hover">
          <p className="text-2xl font-bold text-danger">{highActions.length}</p>
          <p className="mt-1 text-xs font-medium text-text-secondary">Priorité haute</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-1 p-4 text-center transition-all duration-200 hover:border-border-hover">
          <p className="text-2xl font-bold text-warning">{mediumActions.length}</p>
          <p className="mt-1 text-xs font-medium text-text-secondary">Moyenne</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-1 p-4 text-center transition-all duration-200 hover:border-border-hover">
          <p className="text-2xl font-bold text-success">{lowActions.length}</p>
          <p className="mt-1 text-xs font-medium text-text-secondary">Ajustements</p>
        </div>
      </div>

      {/* Action groups */}
      {[
        { label: "Priorité haute", actions: highActions, key: "high" as const },
        { label: "Priorité moyenne", actions: mediumActions, key: "medium" as const },
        { label: "Ajustements", actions: lowActions, key: "low" as const },
      ]
        .filter((g) => g.actions.length > 0)
        .map((group) => (
          <div key={group.key} className="mb-8">
            <h2 className="mb-3 text-sm font-semibold text-text-secondary uppercase tracking-wide">
              {group.label}
            </h2>
            <div className="space-y-3">
              {group.actions.map((action) => {
                const style = PRIORITY_STYLES[action.priority];
                return (
                  <div
                    key={action.id}
                    className="rounded-xl border border-border bg-surface-1 p-5 transition-all duration-200 hover:border-border-hover"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {action.title}
                        </h3>
                        <p className="mt-1 text-sm text-text-secondary">
                          {action.description}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge}`}
                      >
                        {action.priority}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-accent-muted px-2.5 py-0.5 text-xs font-medium text-accent">
                        {action.pillarLabel}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                        {EFFORT_LABELS[action.effort]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      {plan.actions.length === 0 && (
        <div className="rounded-xl border border-border bg-surface-1 p-12 text-center transition-all duration-200 hover:border-border-hover">
          <p className="text-lg font-medium text-foreground">
            Tout est bon !
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Vos scores sont élevés sur tous les piliers. Continuez comme ça.
          </p>
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/score"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Refaire l&apos;évaluation Score
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
