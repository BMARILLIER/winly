import Link from "next/link";
import { Check, Instagram, FileText, ClipboardCheck, Rocket } from "lucide-react";
import { prisma } from "@/lib/db";

type Step = {
  id: string;
  label: string;
  href: string;
  icon: typeof Instagram;
  done: boolean;
};

export async function FirstWinCard({
  userId,
  workspaceId,
}: {
  userId: string;
  workspaceId: string;
}) {
  const [igConnection, contentCount, auditCount] = await Promise.all([
    prisma.instagramConnection.findUnique({
      where: { userId },
      select: { id: true },
    }),
    prisma.contentIdea.count({ where: { workspaceId } }),
    prisma.auditResult.count({ where: { userId } }),
  ]);

  const steps: Step[] = [
    {
      id: "instagram",
      label: "Connecte ton compte Instagram",
      href: "/settings",
      icon: Instagram,
      done: Boolean(igConnection),
    },
    {
      id: "audit",
      label: "Fais ton premier audit créateur",
      href: "/audit",
      icon: ClipboardCheck,
      done: auditCount > 0,
    },
    {
      id: "content",
      label: "Crée ta première idée de contenu",
      href: "/content",
      icon: FileText,
      done: contentCount > 0,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-primary/10 via-surface-1 to-violet/10">
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Démarrage rapide
              </span>
            </div>
            <h2 className="mt-2 text-xl font-bold text-foreground">
              Débloque Winly en 3 étapes
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {doneCount}/{steps.length} terminée{doneCount !== 1 ? "s" : ""} —
              continue, tu gagnes des XP à chaque étape.
            </p>
          </div>
          <div className="shrink-0 rounded-full border border-accent/40 bg-surface-2 px-3 py-1 text-xs font-semibold text-accent">
            {pct}%
          </div>
        </div>

        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-gradient-to-r from-primary to-violet transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.id}
                href={step.href}
                className={`group flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                  step.done
                    ? "border-success/40 bg-success/5"
                    : "border-border bg-surface-2 hover:border-accent/50 hover:bg-surface-3"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    step.done
                      ? "bg-success/20 text-success"
                      : "bg-accent/15 text-accent"
                  }`}
                >
                  {step.done ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      step.done ? "text-success" : "text-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {step.done ? "Terminé" : "Commencer →"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
