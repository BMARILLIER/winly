"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getInstagramConnections,
  disconnectInstagram,
  syncInstagram,
  switchInstagramAccount,
} from "@/lib/actions/instagram";

type Connection = {
  id: string;
  igUserId: string;
  igUsername: string;
  isActive: boolean;
  lastSyncAt: Date | null;
  connectedAt: Date;
  tokenExpiresAt: Date | null;
};

export function InstagramConnection() {
  const searchParams = useSearchParams();
  const igStatus = searchParams.get("ig");

  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getInstagramConnections()
      .then(setConnections)
      .finally(() => setLoading(false));
  }, []);

  const active = connections.find((c) => c.isActive) ?? connections[0] ?? null;

  async function handleSync() {
    setSyncing(true);
    setSyncMessage(null);
    const result = await syncInstagram();
    setSyncing(false);

    if (result.ok) {
      setSyncMessage({
        type: "success",
        text: `Synchronisation terminee : ${result.followers} abonnes, ${result.mediaSynced} posts synchronises.`,
      });
      const updated = await getInstagramConnections();
      setConnections(updated);
    } else {
      setSyncMessage({
        type: "error",
        text: result.error ?? "Erreur lors de la synchronisation.",
      });
    }
  }

  async function handleSwitch(connectionId: string) {
    setSwitching(connectionId);
    await switchInstagramAccount(connectionId);
    const updated = await getInstagramConnections();
    setConnections(updated);
    setSwitching(null);
    setSyncMessage(null);
  }

  async function handleDisconnect(connectionId: string) {
    setDisconnecting(connectionId);
    await disconnectInstagram(connectionId);
    const updated = await getInstagramConnections();
    setConnections(updated);
    setDisconnecting(null);
    setSyncMessage(null);
  }

  function formatDate(date: Date | string | null): string {
    if (!date) return "Jamais";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-6">
      <h2 className="text-lg font-semibold text-foreground">Instagram</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Connectez vos comptes Instagram pour analyser vos performances.
      </p>

      {igStatus === "success" && (
        <div className="mt-3 rounded-lg bg-success/10 px-4 py-2 text-sm text-success">
          Instagram connecte avec succes !
        </div>
      )}
      {igStatus === "error" && (
        <div className="mt-3 rounded-lg bg-danger/10 px-4 py-2 text-sm text-danger">
          Erreur de connexion Instagram. Veuillez reessayer.
        </div>
      )}
      {igStatus === "denied" && (
        <div className="mt-3 rounded-lg bg-warning/10 px-4 py-2 text-sm text-warning">
          Connexion annulee.
        </div>
      )}

      {syncMessage && (
        <div
          className={`mt-3 rounded-lg px-4 py-2 text-sm ${
            syncMessage.type === "success"
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger"
          }`}
        >
          {syncMessage.text}
        </div>
      )}

      <div className="mt-4">
        {loading ? (
          <div className="h-10 w-48 animate-pulse rounded-lg bg-surface-3" />
        ) : connections.length > 0 ? (
          <div className="space-y-4">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className={`rounded-lg border p-3 ${
                  conn.isActive
                    ? "border-accent/50 bg-accent/5"
                    : "border-border bg-surface-2"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        conn.isActive ? "bg-success" : "bg-text-muted"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        conn.isActive ? "text-success" : "text-text-secondary"
                      }`}
                    >
                      @{conn.igUsername}
                    </span>
                    {conn.isActive && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent uppercase tracking-wider">
                        Actif
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!conn.isActive && (
                      <button
                        onClick={() => handleSwitch(conn.id)}
                        disabled={switching === conn.id}
                        className="rounded-lg bg-accent/10 px-3 py-1 text-xs font-medium text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
                      >
                        {switching === conn.id ? "..." : "Activer"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDisconnect(conn.id)}
                      disabled={disconnecting === conn.id}
                      className="rounded-lg bg-danger/10 px-3 py-1 text-xs font-medium text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                    >
                      {disconnecting === conn.id ? "..." : "Supprimer"}
                    </button>
                  </div>
                </div>
                {conn.isActive && (
                  <p className="mt-1 text-xs text-text-muted">
                    Derniere synchronisation : {formatDate(conn.lastSyncAt)}
                  </p>
                )}
              </div>
            ))}

            {active && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
              >
                {syncing ? "Synchronisation..." : "Synchroniser Instagram"}
              </button>
            )}

            {connections.length < 2 && (
              <a
                href="/api/instagram/connect"
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-text-secondary hover:border-accent/50 hover:text-accent transition-colors"
              >
                + Ajouter un autre compte
              </a>
            )}
          </div>
        ) : (
          <a
            href="/api/instagram/connect"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-shadow"
          >
            Connecter Instagram
          </a>
        )}
      </div>
    </div>
  );
}
