import Link from "next/link";
import { Zap, Crown } from "lucide-react";
import { getQuotaStatus } from "@/modules/content-generator";

export async function QuotaBadge({ userId }: { userId: string }) {
  const { used, limit, remaining, plan } = await getQuotaStatus(userId);

  if (plan === "pro") {
    const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    const nearLimit = remaining <= 20;
    return (
      <div className="rounded-lg border border-accent/30 bg-accent/10 p-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Crown className="h-3.5 w-3.5 text-accent" />
            <span className="font-medium text-accent">
              Pro — {used}/{limit} crédits IA ce mois
            </span>
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-accent/20">
          <div
            className={`h-full transition-all ${nearLimit ? "bg-warning" : "bg-accent"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {nearLimit && remaining > 0 && (
          <p className="mt-2 text-xs text-warning">
            Plus que {remaining} crédits ce mois.
          </p>
        )}
      </div>
    );
  }

  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const nearLimit = remaining <= 2;

  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Zap className={`h-3.5 w-3.5 ${nearLimit ? "text-danger" : "text-accent"}`} />
          <span className="font-medium text-foreground">
            {used}/{limit} crédits IA ce mois
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
            ? "Limite atteinte. Passe Pro pour 200 crédits/mois."
            : `Plus que ${remaining} crédit${remaining > 1 ? "s" : ""}. Passe Pro pour 200/mois.`}
        </p>
      )}
    </div>
  );
}
