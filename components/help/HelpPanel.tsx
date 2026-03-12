"use client";

import { useEffect, useCallback } from "react";
import {
  X,
  BookOpen,
  Link as LinkIcon,
  BarChart3,
  Lightbulb,
  LayoutDashboard,
  ClipboardCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface HelpPanelProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    number: 1,
    label: "Connecter votre compte social",
    icon: LinkIcon,
  },
  {
    number: 2,
    label: "Lancer une analyse",
    icon: BarChart3,
  },
  {
    number: 3,
    label: "Lire les recommandations proposées",
    icon: Lightbulb,
  },
];

const MODULES = [
  {
    name: "Tableau de bord",
    description: "Affiche les indicateurs clés de votre compte.",
    icon: LayoutDashboard,
  },
  {
    name: "Analyse",
    description: "Analyse votre profil et vos publications.",
    icon: ClipboardCheck,
  },
  {
    name: "Assistant IA",
    description: "Propose des idées de contenu optimisées.",
    icon: Sparkles,
  },
  {
    name: "Recommandations",
    description: "Vous indique comment améliorer vos performances.",
    icon: TrendingUp,
  },
];

export function HelpPanel({ open, onClose }: HelpPanelProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300"
        style={{ animation: "helpFadeIn 0.25s ease-out" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="fixed top-0 right-0 z-50 flex h-full w-[380px] max-w-[90vw] flex-col border-l border-border bg-surface-1 shadow-[−8px_0_40px_rgba(0,0,0,0.5)]"
        style={{ animation: "helpSlideIn 0.3s ease-out" }}
        role="dialog"
        aria-modal="true"
        aria-label="Guide rapide Winly"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-accent" />
            <h2 className="text-base font-semibold text-foreground">
              Guide rapide Winly
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-surface-3 hover:text-foreground transition-colors"
            aria-label="Fermer l'aide"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Welcome */}
          <div className="space-y-2">
            <p className="text-sm leading-relaxed text-text-secondary">
              Bienvenue sur <span className="font-medium text-foreground">Winly</span>.
            </p>
            <p className="text-sm leading-relaxed text-text-secondary">
              Winly est un assistant intelligent qui analyse votre compte social
              et vous aide à améliorer votre croissance et votre engagement.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Démarrer en 3 étapes
            </h3>
            <div className="space-y-2.5">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface-2/50 px-3.5 py-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                    {step.number}
                  </div>
                  <step.icon className="h-4 w-4 shrink-0 text-text-muted" />
                  <span className="text-sm text-text-secondary">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Modules */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Les modules
            </h3>
            <div className="space-y-2">
              {MODULES.map((mod) => (
                <div
                  key={mod.name}
                  className="flex items-start gap-3 rounded-lg border border-border bg-surface-2/50 px-3.5 py-3"
                >
                  <mod.icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {mod.name}
                    </p>
                    <p className="text-xs leading-relaxed text-text-muted">
                      {mod.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center gap-3 border-t border-border px-5 py-4">
          <button
            onClick={() =>
              alert("Le guide complet sera bientôt disponible.")
            }
            className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            Guide complet
          </button>
          <button
            onClick={() =>
              alert(
                "Le support sera bientôt disponible. Email : support@winly.app"
              )
            }
            className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            Contact support
          </button>
        </div>
      </aside>

      {/* Scoped animations */}
      <style jsx global>{`
        @keyframes helpFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes helpSlideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
