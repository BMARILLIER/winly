"use client";

import { useState, useEffect } from "react";
import { SectionHeader, Card, CardHeader, CardTitle } from "@/components/ui";
import { Gift, Copy, Check, Users, Sparkles } from "lucide-react";
import { getMyReferralStats, submitReferralCode } from "@/lib/actions/referral";

const APP_URL = typeof window !== "undefined" ? window.location.origin : "";

export function ReferralUI() {
  const [stats, setStats] = useState<{ code: string; totalReferred: number; creditsEarned: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemResult, setRedeemResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReferralStats().then((s) => {
      setStats(s);
      setLoading(false);
    });
  }, []);

  function copyLink() {
    if (!stats) return;
    navigator.clipboard.writeText(`${APP_URL}/r/${stats.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRedeem() {
    if (!redeemCode.trim()) return;
    const result = await submitReferralCode(redeemCode.trim());
    setRedeemResult(result);
    if (result.ok) setRedeemCode("");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <SectionHeader
        title="Parrainage"
        description="Invite tes amis createurs et gagne des credits IA gratuits"
      />

      {/* How it works */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Gift className="h-5 w-5 text-accent" />
          Comment ca marche
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-lg font-bold text-accent">1</div>
            <p className="text-sm font-medium text-foreground">Partage ton lien</p>
            <p className="text-xs text-text-muted mt-1">Envoie-le a un ami createur</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-lg font-bold text-accent">2</div>
            <p className="text-sm font-medium text-foreground">Il s&apos;inscrit</p>
            <p className="text-xs text-text-muted mt-1">Il gagne 5 credits bonus</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-lg font-bold text-accent">3</div>
            <p className="text-sm font-medium text-foreground">Tu gagnes 20 credits</p>
            <p className="text-xs text-text-muted mt-1">Utilisables immediatement</p>
          </div>
        </div>
      </div>

      {/* My referral link */}
      <Card>
        <CardHeader>
          <CardTitle>Ton lien de parrainage</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={stats ? `${APP_URL}/r/${stats.code}` : "..."}
            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground font-mono"
          />
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copie !" : "Copier"}
          </button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
          <Users className="h-5 w-5 text-accent mx-auto mb-1" />
          <div className="text-2xl font-bold text-foreground">{stats?.totalReferred ?? 0}</div>
          <div className="text-xs text-text-muted">Amis invites</div>
        </div>
        <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
          <Sparkles className="h-5 w-5 text-accent mx-auto mb-1" />
          <div className="text-2xl font-bold text-foreground">{stats?.creditsEarned ?? 0}</div>
          <div className="text-xs text-text-muted">Credits gagnes</div>
        </div>
        <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
          <Gift className="h-5 w-5 text-accent mx-auto mb-1" />
          <div className="text-2xl font-bold text-foreground">20</div>
          <div className="text-xs text-text-muted">Credits par invite</div>
        </div>
      </div>

      {/* Redeem a code */}
      <Card>
        <CardHeader>
          <CardTitle>Tu as un code de parrainage ?</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={redeemCode}
            onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
            placeholder="Entre le code ici"
            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground font-mono uppercase placeholder:text-text-muted placeholder:normal-case focus:border-accent focus:outline-none"
          />
          <button
            onClick={handleRedeem}
            className="rounded-lg bg-surface-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent hover:text-white transition-colors"
          >
            Activer
          </button>
        </div>
        {redeemResult && (
          <p className={`mt-2 text-sm ${redeemResult.ok ? "text-success" : "text-danger"}`}>
            {redeemResult.ok ? "Code active ! +5 credits IA offerts." : redeemResult.error}
          </p>
        )}
      </Card>
    </div>
  );
}
