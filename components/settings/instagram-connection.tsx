"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getInstagramConnection,
  disconnectInstagram,
  syncInstagram,
} from "@/lib/actions/instagram";

type Connection = {
  igUsername: string;
  connectedAt: Date;
  tokenExpiresAt: Date | null;
  lastSyncAt: Date | null;
} | null;

export function InstagramConnection() {
  const searchParams = useSearchParams();
  const igStatus = searchParams.get("ig");

  const [connection, setConnection] = useState<Connection>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getInstagramConnection()
      .then(setConnection)
      .finally(() => setLoading(false));
  }, []);

  async function handleDisconnect() {
    setDisconnecting(true);
    await disconnectInstagram();
    setConnection(null);
    setDisconnecting(false);
    setSyncMessage(null);
  }

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
      // Refresh connection data (lastSyncAt)
      const updated = await getInstagramConnection();
      setConnection(updated);
    } else {
      setSyncMessage({
        type: "error",
        text: result.error ?? "Erreur lors de la synchronisation.",
      });
    }
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
        Connectez votre compte Instagram pour analyser vos performances.
      </p>

      {/* OAuth status messages */}
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

      {/* Sync status messages */}
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
        ) : connection ? (
          <div className="space-y-4">
            {/* Connected status */}
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2 w-fit">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span className="text-sm font-medium text-success">
                @{connection.igUsername}
              </span>
            </div>

            {/* Last sync */}
            <p className="text-xs text-text-muted">
              Derniere synchronisation : {formatDate(connection.lastSyncAt)}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
              >
                {syncing ? "Synchronisation..." : "Synchroniser Instagram"}
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
              >
                {disconnecting ? "Deconnexion..." : "Deconnecter"}
              </button>
            </div>
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
