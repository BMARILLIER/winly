"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui";
import { Sparkles } from "lucide-react";
import { CompetitorAIPanel } from "./competitor-ai-panel";
import { CompetitorsUI } from "./competitors-ui";
import { DemoBanner } from "@/components/ui/demo-banner";

export function CompetitorsTabs() {
  const [tab, setTab] = useState<"ai" | "overview">("ai");

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Concurrents"
        description="Apprends de tes concurrents avec l'IA, puis passe à l'action"
      />

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setTab("ai")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "ai"
              ? "border-accent text-accent"
              : "border-transparent text-text-secondary hover:text-foreground"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Analyse IA
        </button>
        <button
          onClick={() => setTab("overview")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "overview"
              ? "border-accent text-accent"
              : "border-transparent text-text-secondary hover:text-foreground"
          }`}
        >
          Aperçu radar
        </button>
      </div>

      {tab === "ai" && <CompetitorAIPanel />}
      {tab === "overview" && (
        <>
          <DemoBanner feature="L'aperçu radar concurrentiel" />
          <CompetitorsUI />
        </>
      )}
    </div>
  );
}
