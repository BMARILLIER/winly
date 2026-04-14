"use client";

import { useState } from "react";
import { setActivePersona } from "@/lib/actions/persona";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PersonaCardProps {
  persona: {
    id: string;
    name: string;
    niche: string;
    tone: string;
    platform: string;
    bio: string;
    catchphrase: string;
    visualStyle: string;
    isActive: boolean;
  };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function platformLabel(platform: string): string {
  if (platform === "les_deux") return "Instagram + TikTok";
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

export function PersonaCard({ persona }: PersonaCardProps) {
  const [activating, setActivating] = useState(false);
  const router = useRouter();

  async function handleActivate() {
    setActivating(true);
    await setActivePersona(persona.id);
    router.refresh();
    setActivating(false);
  }

  const truncatedBio =
    persona.bio.length > 100
      ? persona.bio.slice(0, 97) + "..."
      : persona.bio;

  return (
    <div
      className={`rounded-xl border p-5 transition-all ${
        persona.isActive
          ? "border-accent bg-accent-muted/20"
          : "border-border bg-surface-1"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white ${
            persona.isActive
              ? "bg-gradient-to-br from-primary to-violet"
              : "bg-surface-2 text-text-muted"
          }`}
        >
          {persona.isActive ? (
            getInitials(persona.name)
          ) : (
            <span className="text-text-muted">{getInitials(persona.name)}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-foreground">
              {persona.name}
            </h3>
            {persona.isActive && (
              <span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">
                Actif
              </span>
            )}
          </div>

          <p className="text-sm text-text-muted">
            {persona.niche} · {persona.tone} · {platformLabel(persona.platform)}
          </p>

          <p className="text-sm text-text-secondary leading-relaxed">
            {truncatedBio}
          </p>

          <p className="text-sm text-accent italic">
            &ldquo;{persona.catchphrase}&rdquo;
          </p>
        </div>

        {/* Action */}
        {!persona.isActive && (
          <button
            onClick={handleActivate}
            disabled={activating}
            className="shrink-0 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:text-foreground hover:border-border-hover transition-all disabled:opacity-50 inline-flex items-center gap-2"
          >
            {activating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ...
              </>
            ) : (
              "Activer"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
