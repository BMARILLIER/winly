"use client";

import Link from "next/link";
import { DealAnalyzerWidget } from "@/components/ui/deal-analyzer-widget";
import type { CreatorProfile } from "@/modules/deal-analyzer";

interface Props {
  creatorProfile: CreatorProfile;
  hasInstagram: boolean;
  followers: number | null;
  engagementRate: number | null;
  niche: string;
}

export function DealAnalyzerPageUI({
  creatorProfile,
  hasInstagram,
  followers,
  engagementRate,
  niche,
}: Props) {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Deal Analyzer</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Evaluez une offre de marque en un clic
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main widget — takes 2 cols */}
        <div className="lg:col-span-2">
          <DealAnalyzerWidget creatorProfile={creatorProfile} />
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Your profile */}
          <div className="rounded-xl border border-border bg-surface-1 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Votre profil
            </h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-xs text-text-muted">Followers</dt>
                <dd className="text-xs font-medium text-foreground">
                  {hasInstagram && followers
                    ? followers.toLocaleString("fr-FR")
                    : "~5 000 (estimation)"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-text-muted">Engagement</dt>
                <dd className="text-xs font-medium text-foreground">
                  {hasInstagram && engagementRate != null
                    ? `${(engagementRate * 100).toFixed(1)}%`
                    : "~3.5% (estimation)"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-text-muted">Niche</dt>
                <dd className="text-xs font-medium text-foreground capitalize">{niche}</dd>
              </div>
            </dl>
            {!hasInstagram && (
              <Link
                href="/settings"
                className="mt-3 block text-center text-[11px] text-accent hover:underline"
              >
                Connecter Instagram pour des prix precis
              </Link>
            )}
          </div>

          {/* How it works */}
          <div className="rounded-xl border border-border bg-surface-1 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Comment ca marche
            </h3>
            <ol className="space-y-2 text-xs text-text-secondary">
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[10px] font-bold text-foreground">
                  1
                </span>
                Entrez le prix propose par la marque
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[10px] font-bold text-foreground">
                  2
                </span>
                Selectionnez le type de contenu
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[10px] font-bold text-foreground">
                  3
                </span>
                Verdict instantane : sous-paye, correct, ou bon deal
              </li>
            </ol>
          </div>

          {/* Pricing guide */}
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Guide de negociation
            </h3>
            <ul className="space-y-1.5 text-xs text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                Sous-paye : refusez ou negociez +30% minimum
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                Fair : acceptez si la marque est strategique
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                Bon deal : foncez, c'est au-dessus du marche
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
