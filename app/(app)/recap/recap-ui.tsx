"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SectionHeader } from "@/components/ui";
import { Download, Share2, Instagram, TrendingUp, Heart, MessageCircle, Flame, Award } from "lucide-react";
import { fetchRecap, type ShareableRecap } from "@/lib/actions/shareable-recap";

export function RecapUI() {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [recap, setRecap] = useState<ShareableRecap | null>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetchRecap(period).then((r) => {
      setRecap(r);
      setLoading(false);
    });
  }, [period]);

  const downloadImage = useCallback(async () => {
    const card = cardRef.current;
    if (!card) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(card, {
        backgroundColor: "#0b0b0f",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `winly-recap-${period}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("Erreur lors de la generation de l'image. Fais un screenshot a la place.");
    }
  }, [period]);

  const shareImage = useCallback(async () => {
    const card = cardRef.current;
    if (!card) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(card, {
        backgroundColor: "#0b0b0f",
        scale: 2,
        useCORS: true,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `winly-recap-${period}.png`, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Mon recap Winly",
            text: "Mes stats Instagram de la semaine avec @winly_app",
          });
        } else {
          // Fallback: download
          const link = document.createElement("a");
          link.download = file.name;
          link.href = URL.createObjectURL(blob);
          link.click();
        }
      }, "image/png");
    } catch {
      alert("Utilise le bouton Telecharger puis partage manuellement.");
    }
  }, [period]);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Mon Recap"
        description="Genere ta carte de stats et partage-la en Story"
      />

      <div className="flex gap-2">
        {(["week", "month"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              period === p
                ? "bg-accent text-white"
                : "bg-surface-2 text-text-secondary hover:bg-surface-3"
            }`}
          >
            {p === "week" ? "Cette semaine" : "Ce mois"}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}

      {!loading && recap && !recap.hasData && (
        <div className="rounded-xl border border-border bg-surface-1 p-8 text-center text-sm text-text-secondary">
          Connecte Instagram et synchronise pour generer ton recap.
        </div>
      )}

      {!loading && recap?.hasData && (
        <>
          {/* Shareable card */}
          <div className="flex justify-center">
            <div
              ref={cardRef}
              className="w-[400px] rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0b0b0f 0%, #1a1025 50%, #0f0a1a 100%)" }}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">W</span>
                    </div>
                    <span className="text-sm font-semibold text-white/80">winly.app</span>
                  </div>
                  <span className="text-xs text-white/40">{recap.periodLabel}</span>
                </div>
                {recap.username && (
                  <div className="mt-3 flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-400" />
                    <span className="text-lg font-bold text-white">@{recap.username}</span>
                  </div>
                )}
              </div>

              {/* Stats grid */}
              <div className="px-6 py-4 grid grid-cols-2 gap-3">
                {recap.followers != null && (
                  <StatBox
                    icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
                    value={formatNum(recap.followers)}
                    label="Followers"
                    delta={recap.followersDelta != null ? `${recap.followersDelta >= 0 ? "+" : ""}${recap.followersDelta}` : undefined}
                    deltaColor={recap.followersDelta && recap.followersDelta >= 0 ? "text-emerald-400" : "text-red-400"}
                  />
                )}
                {recap.engagementRate && (
                  <StatBox
                    icon={<Heart className="h-4 w-4 text-pink-400" />}
                    value={`${recap.engagementRate}%`}
                    label="Engagement"
                  />
                )}
                {recap.topPostLikes != null && (
                  <StatBox
                    icon={<Heart className="h-4 w-4 text-red-400" />}
                    value={formatNum(recap.topPostLikes)}
                    label="Top post likes"
                  />
                )}
                <StatBox
                  icon={<MessageCircle className="h-4 w-4 text-blue-400" />}
                  value={String(recap.postsCount)}
                  label={`Post${recap.postsCount > 1 ? "s" : ""} publies`}
                />
              </div>

              {/* Streak + Level */}
              <div className="px-6 pb-4 flex items-center gap-4">
                {recap.streakDays > 0 && (
                  <div className="flex items-center gap-1.5 rounded-full bg-orange-500/20 px-3 py-1">
                    <Flame className="h-3.5 w-3.5 text-orange-400" />
                    <span className="text-xs font-bold text-orange-300">{recap.streakDays}j streak</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1">
                  <Award className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-bold text-violet-300">Niveau {recap.level}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-white/30">Propulse par Winly — ton coach IA Instagram</span>
                <span className="text-[10px] text-white/20">winly.app</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-3">
            <button
              onClick={downloadImage}
              className="inline-flex items-center gap-2 rounded-xl bg-surface-2 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-surface-3 transition-colors"
            >
              <Download className="h-4 w-4" />
              Telecharger
            </button>
            <button
              onClick={shareImage}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all"
            >
              <Share2 className="h-4 w-4" />
              Partager en Story
            </button>
          </div>

          <p className="text-center text-xs text-text-muted">
            Telecharge l&apos;image puis ajoute-la a ta Story Instagram. Chaque partage fait decouvrir Winly a ta communaute.
          </p>
        </>
      )}
    </div>
  );
}

function StatBox({
  icon,
  value,
  label,
  delta,
  deltaColor,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  delta?: string;
  deltaColor?: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-white/50 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold text-white">{value}</span>
        {delta && <span className={`text-xs font-semibold ${deltaColor}`}>{delta}</span>}
      </div>
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
