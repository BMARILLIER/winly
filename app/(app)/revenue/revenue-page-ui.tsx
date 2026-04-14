"use client";

import Link from "next/link";
import type { RevenueReport } from "@/modules/revenue";

const GROWTH_COLORS: Record<string, string> = {
  explosive: "text-success",
  strong: "text-info",
  moderate: "text-warning",
  early: "text-text-secondary",
};

function formatEuro(n: number): string {
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

interface Props {
  report: RevenueReport;
  hasInstagram: boolean;
  niche: string;
  followers: number | null;
  engagementRate: number | null;
}

export function RevenuePageUI({ report, hasInstagram, niche, followers, engagementRate }: Props) {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Revenue</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Estimations de monetisation basees sur {hasInstagram ? "vos donnees Instagram" : `la niche ${niche}`}
        </p>
      </div>

      {/* Hero numbers */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-surface-1 to-surface-2 p-6">
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-3">
            Revenus / mois
          </p>
          <p className="text-3xl font-bold text-foreground tracking-tight">
            {formatEuro(report.monthlyEarningsMin)} - {formatEuro(report.monthlyEarningsMax)}
          </p>
          <p className="text-xs text-text-muted mt-1">EUR estimes</p>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-to-br from-surface-1 to-surface-2 p-6">
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-3">
            Valeur / post
          </p>
          <p className="text-3xl font-bold text-foreground tracking-tight">
            {report.postValueMin} - {report.postValueMax}
          </p>
          <p className="text-xs text-text-muted mt-1">EUR par collaboration</p>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-to-br from-surface-1 to-surface-2 p-6">
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-3">
            Score du compte
          </p>
          <p className="text-3xl font-bold text-foreground tracking-tight">
            {report.accountValueScore}
            <span className="text-lg text-text-muted">/100</span>
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-surface-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${report.accountValueScore}%`,
                background:
                  report.accountValueScore >= 70
                    ? "var(--success)"
                    : report.accountValueScore >= 40
                      ? "var(--warning)"
                      : "var(--danger)",
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-to-br from-surface-1 to-surface-2 p-6">
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-3">
            Potentiel
          </p>
          <p className={`text-2xl font-bold tracking-tight ${GROWTH_COLORS[report.growthPotential]}`}>
            {report.growthPotentialLabel}
          </p>
          <p className="text-xs text-text-muted mt-1">{report.tierLabel}</p>
        </div>
      </div>

      {/* Context info */}
      {hasInstagram && followers && engagementRate != null && (
        <div className="rounded-xl border border-border bg-surface-1 p-5 mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Base de calcul</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-text-muted">Followers</p>
              <p className="text-lg font-bold text-foreground">{followers.toLocaleString("fr-FR")}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Engagement</p>
              <p className="text-lg font-bold text-foreground">{(engagementRate * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Niche</p>
              <p className="text-lg font-bold text-foreground capitalize">{niche}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Comment augmenter vos revenus</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-xs text-text-secondary">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            Augmentez votre engagement au-dessus de 5% pour attirer les marques premium
          </li>
          <li className="flex items-start gap-2 text-xs text-text-secondary">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            Publiez regulierement (12+ posts/mois) pour construire votre audience
          </li>
          <li className="flex items-start gap-2 text-xs text-text-secondary">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            Les Reels et Carrousels generent les meilleurs taux d'engagement
          </li>
        </ul>
      </div>

      {!hasInstagram && (
        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary mb-3">
            Ces chiffres sont des estimations basees sur votre niche.
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Connecter Instagram pour des chiffres reels
          </Link>
        </div>
      )}
    </div>
  );
}
