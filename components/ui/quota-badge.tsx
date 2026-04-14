import Link from "next/link";
import { Zap, Crown } from "lucide-react";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/stripe";

export async function QuotaBadge({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, generationsUsed: true, generationsReset: true },
  });
  if (!user) return null;

  // Reset virtuel mensuel (même règle que le module content-generator)
  const now = new Date();
  const needsReset =
    !user.generationsReset ||
    user.generationsReset.getUTCFullYear() !== now.getUTCFullYear() ||
    user.generationsReset.getUTCMonth() !== now.getUTCMonth();
  const used = needsReset ? 0 : user.generationsUsed;

  if (user.plan === "pro") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs">
        <Crown className="h-3.5 w-3.5 text-accent" />
        <span className="font-medium text-accent">Pro — générations illimitées</span>
      </div>
    );
  }

  const limit = PLANS.FREE.generationsLimit;
  const remaining = Math.max(0, limit - used);
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const nearLimit = remaining <= 1;

  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Zap className={`h-3.5 w-3.5 ${nearLimit ? "text-danger" : "text-accent"}`} />
          <span className="font-medium text-foreground">
            {used}/{limit} générations ce mois
          </span>
        </div>
        <Link href="/pricing" className="font-medium text-accent hover:underline">
          Passer Pro →
        </Link>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-1">
        <div
          className={`h-full transition-all ${
            nearLimit ? "bg-danger" : "bg-gradient-to-r from-primary to-violet"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {nearLimit && (
        <p className="mt-2 text-xs text-danger">
          {remaining === 0
            ? "Limite atteinte. Passe Pro pour débloquer."
            : `Plus qu'${remaining} génération. Passe Pro pour l'illimité.`}
        </p>
      )}
    </div>
  );
}
