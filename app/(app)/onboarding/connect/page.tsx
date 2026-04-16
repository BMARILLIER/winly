"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Instagram, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { getInstagramConnection } from "@/lib/actions/instagram";

export default function OnboardingConnectPage() {
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getInstagramConnection().then((conn) => {
      setConnected(!!conn);
      setChecking(false);
    });
  }, []);

  // Re-check when user comes back from OAuth
  useEffect(() => {
    function handleFocus() {
      getInstagramConnection().then((conn) => {
        if (conn) setConnected(true);
      });
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <div className="mx-auto max-w-xl">
      {/* Progress bar — step 6/6 */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
          <span>Dernière étape</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-3">
          <div
            className="h-1.5 rounded-full bg-accent transition-all duration-300"
            style={{ width: connected ? "100%" : "90%" }}
          />
        </div>
      </div>

      {!connected ? (
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 border border-pink-500/30">
            <Instagram className="h-10 w-10 text-pink-400" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            Connecte ton Instagram
          </h1>
          <p className="mt-3 text-text-secondary max-w-md mx-auto">
            C'est la clé pour débloquer toute la puissance de Winly : analytics,
            insights IA, score créateur, et recommandations personnalisées.
          </p>

          <div className="mt-8 space-y-4">
            <a
              href="/api/instagram/connect"
              className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              <Instagram className="h-5 w-5" />
              Connecter Instagram
            </a>

            <div className="grid grid-cols-3 gap-3 mt-8 text-left">
              {[
                { label: "Analytics en temps réel", desc: "Followers, engagement, reach" },
                { label: "Insights IA personnalisés", desc: "Recommandations basées sur tes stats" },
                { label: "Score créateur", desc: "Évalue ta performance vs ta niche" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-surface-1 p-3">
                  <Sparkles className="h-4 w-4 text-accent mb-1" />
                  <p className="text-xs font-semibold text-foreground">{item.label}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/dashboard"
            className="mt-8 inline-block text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            Passer pour l'instant →
          </Link>
        </div>
      ) : (
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/20 border border-success/30">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            Tout est prêt !
          </h1>
          <p className="mt-3 text-text-secondary max-w-md mx-auto">
            Instagram est connecté et tes données sont en cours de synchronisation.
            Ton dashboard est prêt avec tes vraies données.
          </p>

          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-accent-hover transition-all hover:scale-[1.02]"
          >
            Découvrir mon dashboard
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      )}

      {checking && (
        <div className="mt-8 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}
    </div>
  );
}
