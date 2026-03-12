"use client";

import { useState, useMemo } from "react";
import {
  findOpportunities,
  COMPETITION_STYLES,
  POTENTIAL_STYLES,
} from "@/modules/opportunity-finder";
import type { ContentOpportunity } from "@/modules/opportunity-finder";
import type { Niche } from "@/types";
import { nicheLabel } from "@/types";
import { SectionHeader, Card, Badge } from "@/components/ui";
import { Search, TrendingUp, FlaskConical } from "lucide-react";
import { useRouter } from "next/navigation";

const NICHES: { id: Niche | "all"; label: string }[] = [
  { id: "all", label: "Toutes les niches" },
  { id: "fitness", label: "Fitness" },
  { id: "tech", label: "Tech" },
  { id: "entrepreneurship", label: "Entrepreneurship" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "finance", label: "Finance" },
  { id: "marketing", label: "Marketing" },
  { id: "wellness", label: "Wellness" },
  { id: "travel", label: "Travel" },
];

interface Props {
  defaultNiche: string;
}

export function OpportunityFinderUI({ defaultNiche }: Props) {
  const [selectedNiche, setSelectedNiche] = useState<Niche | "all">(
    (defaultNiche as Niche) ?? "all"
  );

  const opportunities = useMemo(
    () => findOpportunities(selectedNiche === "all" ? undefined : selectedNiche),
    [selectedNiche]
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Opportunity Finder"
        description="Sujets à fort engagement encore peu exploités dans votre niche"
      />

      {/* Niche filter */}
      <div className="flex flex-wrap gap-2">
        {NICHES.map((n) => (
          <button
            key={n.id}
            onClick={() => setSelectedNiche(n.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedNiche === n.id
                ? "bg-accent text-white"
                : "bg-surface-2 text-text-secondary hover:bg-surface-3"
            }`}
          >
            {n.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-text-muted">
        {opportunities.length} opportunité{opportunities.length > 1 ? "s" : ""} détectée{opportunities.length > 1 ? "s" : ""}
      </p>

      {/* Opportunity cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {opportunities.map((opp) => (
          <OpportunityFinderCard key={opp.id} opportunity={opp} />
        ))}
      </div>

      {opportunities.length === 0 && (
        <div className="rounded-xl border border-border bg-surface-1 p-8 text-center">
          <Search className="h-8 w-8 text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-muted">Aucune opportunité trouvée pour cette niche.</p>
        </div>
      )}
    </div>
  );
}

function OpportunityFinderCard({ opportunity: opp }: { opportunity: ContentOpportunity }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const compStyle = COMPETITION_STYLES[opp.competition];
  const potStyle = POTENTIAL_STYLES[opp.potential];

  function handleTestInLab(e: React.MouseEvent) {
    e.stopPropagation();
    const params = new URLSearchParams({
      subject: opp.title,
      hook: opp.recommendation.split(".")[0],
      format: opp.format ?? (opp.engagementLevel >= 80 ? "reel" : "carousel"),
      duration: opp.duration ?? "short",
    });
    router.push(`/content-lab?${params.toString()}`);
  }

  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:border-border-hover"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <Badge variant="default" className="text-[10px]">
          {nicheLabel(opp.niche)}
        </Badge>
        <span className="text-lg font-bold text-foreground">{opp.score}</span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground mb-2">{opp.title}</h3>

      {/* Score bar */}
      <div className="h-1.5 rounded-full bg-surface-2 mb-3">
        <div
          className={`h-1.5 rounded-full ${
            opp.score >= 70 ? "bg-success" : opp.score >= 45 ? "bg-warning" : "bg-danger"
          }`}
          style={{ width: `${opp.score}%` }}
        />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${compStyle.color}`}>
          Concurrence : {compStyle.label}
        </span>
        <span className={`text-[10px] font-semibold ${potStyle.color}`}>
          Potentiel : {potStyle.label}
        </span>
      </div>

      {/* Mini metrics */}
      <div className="flex gap-3 text-[10px] text-text-muted mb-2">
        <span>Engagement : {opp.engagementLevel}/100</span>
        <span>Volume : {opp.volumeLevel}/100</span>
      </div>

      {/* Recommendation (always visible) */}
      <div className="rounded-lg bg-accent-muted p-2.5">
        <p className="text-xs text-accent">
          <span className="font-semibold">Recommandation :</span> {opp.recommendation}
        </p>
      </div>

      {/* Test in Content Lab */}
      <button
        onClick={handleTestInLab}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/10 transition-colors"
      >
        <FlaskConical className="h-3.5 w-3.5" />
        Tester dans Content Lab
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-3 border-t border-border pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-accent" />
            <p className="text-xs text-text-secondary">
              {opp.competition === "faible"
                ? "Peu de créateurs couvrent ce sujet — fenêtre d'opportunité ouverte."
                : opp.competition === "moyenne"
                  ? "Sujet partiellement couvert — un angle original peut percer."
                  : "Sujet populaire mais l'engagement reste fort — la qualité fait la différence."}
            </p>
          </div>
          <p className="text-xs text-text-muted">
            Score = engagement (×0.6) + inverse du volume (×0.4). Plus le sujet engage et moins il est couvert, plus le score est élevé.
          </p>
        </div>
      )}
    </Card>
  );
}
