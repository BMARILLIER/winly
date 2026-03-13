"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { syncInstagram, disconnectInstagram } from "@/lib/actions/instagram";
import { injectMockInstagramData, clearMockInstagramData } from "@/lib/actions/instagram-mock";

type DebugData = {
  connection: {
    igUserId: string;
    igUsername: string;
    connectedAt: string;
    lastSyncAt: string | null;
    tokenExpiresAt: string | null;
  } | null;
  snapshot: {
    followers: number | null;
    follows: number | null;
    mediaCount: number | null;
    reach: number | null;
    impressions: number | null;
    profileViews: number | null;
    createdAt: string;
  } | null;
  recentMedia: {
    id: string;
    mediaType: string;
    caption: string | null;
    likeCount: number;
    commentsCount: number;
    reach: number | null;
    timestamp: string;
  }[];
  mediaTotal: number;
  aiInsights: {
    id: string;
    category: string;
    title: string;
    description: string;
    impact: string;
    metric: string | null;
    source: string;
  }[];
};

function fmt(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Badge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ok
          ? "bg-success/10 text-success"
          : "bg-danger/10 text-danger"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-success" : "bg-danger"}`} />
      {ok ? "Connecté" : "Non connecté"}
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 overflow-hidden">
      <div className="border-b border-border bg-surface-2 px-5 py-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-lg font-semibold text-foreground tabular-nums">{value ?? "—"}</p>
    </div>
  );
}

const IMPACT_COLORS: Record<string, string> = {
  high: "bg-danger/10 text-danger",
  medium: "bg-warning/10 text-warning",
  low: "bg-success/10 text-success",
};

export function InstagramDebugPanel({ data }: { data: DebugData }) {
  const searchParams = useSearchParams();
  const igStatus = searchParams.get("ig");
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [mockMessage, setMockMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [syncLog, setSyncLog] = useState<{
    type: "success" | "error";
    text: string;
    time: string;
  } | null>(null);

  async function handleSync() {
    setSyncing(true);
    setSyncLog(null);
    const result = await syncInstagram();
    setSyncing(false);
    setSyncLog({
      type: result.ok ? "success" : "error",
      text: result.ok
        ? `Succès — ${result.followers} abonnés, ${result.mediaSynced} posts récupérés.`
        : `Erreur — ${result.error ?? "Échec de la synchronisation."}`,
      time: new Date().toISOString(),
    });
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    await disconnectInstagram();
    setDisconnecting(false);
    window.location.reload();
  }

  async function handleInjectMock() {
    setInjecting(true);
    setMockMessage(null);
    const result = await injectMockInstagramData();
    setInjecting(false);
    setMockMessage({
      type: result.ok ? "success" : "error",
      text: result.ok ? result.summary! : `Erreur : ${result.error}`,
    });
    if (result.ok) {
      setTimeout(() => window.location.reload(), 1500);
    }
  }

  async function handleClearMock() {
    setClearing(true);
    setMockMessage(null);
    const result = await clearMockInstagramData();
    setClearing(false);
    if (result.ok) {
      window.location.reload();
    } else {
      setMockMessage({ type: "error", text: `Erreur : ${result.error}` });
    }
  }

  const conn = data.connection;
  const snap = data.snapshot;
  const engagementRate =
    snap && snap.followers && snap.followers > 0 && data.recentMedia.length > 0
      ? (
          ((data.recentMedia.reduce((s, m) => s + m.likeCount + m.commentsCount, 0) /
            data.recentMedia.length) /
            snap.followers) *
          100
        ).toFixed(2)
      : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Instagram Debug Panel</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Vérification complète de l&apos;intégration Instagram.
        </p>
      </div>

      {/* Section 0 — Données de test */}
      <Card title="Données de test Instagram">
        <p className="text-sm text-text-secondary mb-4">
          Injectez des données Instagram simulées pour tester le scoring, growth et IA sans avoir besoin d&apos;un compte Meta Developer.
        </p>

        {mockMessage && (
          <div
            className={`mb-4 rounded-lg px-4 py-2 text-sm ${
              mockMessage.type === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            }`}
          >
            {mockMessage.text}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleInjectMock}
            disabled={injecting}
            className="rounded-lg bg-gradient-to-r from-primary to-violet px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 cursor-pointer"
          >
            {injecting ? "Injection en cours..." : "Injecter données de test"}
          </button>
          {conn && (
            <button
              onClick={handleClearMock}
              disabled={clearing}
              className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger hover:bg-danger/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {clearing ? "Suppression..." : "Supprimer les données"}
            </button>
          )}
        </div>

        <p className="mt-3 text-xs text-text-muted">
          Profil simulé : @barbara.crowft_dj — ~8 500 abonnés, 15 posts, 90 jours d&apos;historique.
        </p>
      </Card>

      {/* OAuth status messages */}
      {igStatus === "success" && (
        <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
          Instagram connecté avec succès !
        </div>
      )}
      {igStatus === "error" && (
        <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
          Erreur de connexion Instagram. Vérifiez les logs ci-dessous.
        </div>
      )}
      {igStatus === "denied" && (
        <div className="rounded-lg bg-warning/10 px-4 py-3 text-sm text-warning">
          Connexion Instagram annulée.
        </div>
      )}

      {/* Section 1 — Connexion */}
      <Card title="Connexion Instagram">
        {conn ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge ok />
              <span className="text-sm font-medium text-foreground">@{conn.igUsername}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <p className="text-xs text-text-muted">User ID Instagram</p>
                <p className="font-mono text-xs text-foreground">{conn.igUserId}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Connecté le</p>
                <p className="text-xs text-foreground">{fmt(conn.connectedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Dernière sync</p>
                <p className="text-xs text-foreground">{fmt(conn.lastSyncAt)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Expiration token</p>
                <p className="text-xs text-foreground">{fmt(conn.tokenExpiresAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {syncing ? "Synchronisation..." : "Synchroniser Instagram"}
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger hover:bg-danger/20 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {disconnecting ? "Déconnexion..." : "Déconnecter"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Badge ok={false} />
            <a
              href="/api/instagram/connect"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-shadow"
            >
              Connecter Instagram
            </a>
          </div>
        )}
      </Card>

      {/* Section 2 — Statistiques */}
      <Card title="Statistiques compte">
        {snap ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            <StatItem label="Followers" value={snap.followers?.toLocaleString("fr-FR") ?? "—"} />
            <StatItem label="Follows" value={snap.follows?.toLocaleString("fr-FR") ?? "—"} />
            <StatItem label="Publications" value={snap.mediaCount ?? "—"} />
            <StatItem label="Reach (28j)" value={snap.reach?.toLocaleString("fr-FR") ?? "—"} />
            <StatItem label="Impressions" value={snap.impressions?.toLocaleString("fr-FR") ?? "—"} />
            <StatItem label="Engagement" value={engagementRate !== "—" ? `${engagementRate}%` : "—"} />
          </div>
        ) : (
          <p className="text-sm text-text-muted">Aucun snapshot disponible. Lancez une synchronisation.</p>
        )}
        {snap && (
          <p className="mt-3 text-xs text-text-muted">
            Snapshot du {fmt(snap.createdAt)}
          </p>
        )}
      </Card>

      {/* Section 3 — Derniers posts */}
      <Card title={`Derniers posts (${data.recentMedia.length} / ${data.mediaTotal} total)`}>
        {data.recentMedia.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-text-muted">
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Caption</th>
                  <th className="pb-2 pr-4 text-right">Likes</th>
                  <th className="pb-2 pr-4 text-right">Comments</th>
                  <th className="pb-2 pr-4 text-right">Reach</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentMedia.map((m) => (
                  <tr key={m.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-4">
                      <span className="rounded bg-surface-2 px-2 py-0.5 text-xs font-mono">
                        {m.mediaType}
                      </span>
                    </td>
                    <td className="py-2 pr-4 max-w-[200px] truncate text-text-secondary text-xs">
                      {m.caption ?? "—"}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">{m.likeCount}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{m.commentsCount}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{m.reach ?? "—"}</td>
                    <td className="py-2 text-xs text-text-muted">{fmt(m.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-muted">Aucun post synchronisé.</p>
        )}
      </Card>

      {/* Section 4 — Analyse IA */}
      <Card title={`Analyse IA (${data.aiInsights.length} insights)`}>
        {data.aiInsights.length > 0 ? (
          <div className="space-y-3">
            {data.aiInsights.map((insight) => (
              <div
                key={insight.id}
                className="rounded-lg border border-border/50 bg-surface-2 p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                      IMPACT_COLORS[insight.impact] ?? "bg-surface-3 text-text-muted"
                    }`}
                  >
                    {insight.impact}
                  </span>
                  <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-text-muted uppercase">
                    {insight.category}
                  </span>
                  <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-text-muted">
                    source : {insight.source}
                  </span>
                  {insight.metric && (
                    <span className="ml-auto text-xs font-semibold text-accent tabular-nums">
                      {insight.metric}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-foreground">{insight.title}</p>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Aucun insight IA généré. Connectez Instagram et lancez une analyse.
          </p>
        )}
      </Card>

      {/* Section 5 — Logs de sync */}
      <Card title="Logs de synchronisation">
        {syncLog ? (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              syncLog.type === "success"
                ? "bg-success/10 text-success"
                : "bg-danger/10 text-danger"
            }`}
          >
            <p className="font-medium">{syncLog.text}</p>
            <p className="mt-1 text-xs opacity-70">{fmt(syncLog.time)}</p>
          </div>
        ) : conn?.lastSyncAt ? (
          <div className="text-sm text-text-secondary">
            <p>Dernière synchronisation réussie : {fmt(conn.lastSyncAt)}</p>
            <p className="mt-1 text-xs text-text-muted">
              {data.mediaTotal} posts en base — {data.recentMedia.length} affichés ci-dessus.
            </p>
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Aucune synchronisation effectuée.
          </p>
        )}
      </Card>
    </div>
  );
}
