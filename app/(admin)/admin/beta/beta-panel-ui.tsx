"use client";

import { useState } from "react";
import { approveBetaRequest, rejectBetaRequest, revokeBetaAccess, deleteBetaRequest } from "@/lib/actions/beta";

interface BetaRequest {
  id: string;
  email: string;
  status: string;
  inviteToken: string | null;
  approvedAt: Date | null;
  inviteSentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface BetaStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  limit: number;
  remaining: number;
}

interface Props {
  requests: BetaRequest[];
  stats: BetaStats;
}

const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-danger/10 text-danger",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Refusé",
};

export function BetaPanelUI({ requests, stats }: Props) {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  function buildInviteLink(token: string) {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/register?invite=${token}`;
  }

  function copyInviteLink(id: string, token: string) {
    const link = buildInviteLink(token);
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Accès bêta</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Gérez la liste d&apos;attente et les approbations de la bêta privée
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatBox label="Total demandes" value={stats.total} />
        <StatBox label="Approuvées" value={stats.approved} color="text-success" />
        <StatBox label="En attente" value={stats.pending} color="text-warning" />
        <StatBox label="Refusées" value={stats.rejected} color="text-danger" />
        <StatBox label="Places restantes" value={stats.remaining} color={stats.remaining <= 10 ? "text-danger" : "text-accent"} />
      </div>

      {/* Capacity bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-text-secondary">Capacité bêta</span>
          <span className="font-medium text-foreground">{stats.approved} / {stats.limit}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface-3">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-primary via-violet to-cyan transition-all"
            style={{ width: `${Math.min(100, (stats.approved / stats.limit) * 100)}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
              filter === f
                ? "border-accent bg-accent-muted text-accent"
                : "border-border bg-surface-1 text-text-secondary hover:bg-surface-2"
            }`}
          >
            {f === "all" ? "Tous" : statusLabels[f]}
            {f !== "all" && (
              <span className="ml-1 text-text-muted">
                ({f === "pending" ? stats.pending : f === "approved" ? stats.approved : stats.rejected})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Email</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Date</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Statut</th>
              <th className="px-4 py-3 text-right font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  Aucune demande trouvée.
                </td>
              </tr>
            )}
            {filtered.map((req) => (
              <tr key={req.id} className="hover:bg-surface-2 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{req.email}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {new Date(req.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[req.status] ?? ""}`}>
                      {statusLabels[req.status] ?? req.status}
                    </span>
                    {req.status === "approved" && req.inviteSentAt && (
                      <span className="text-[10px] text-success">Email envoyé</span>
                    )}
                    {req.status === "approved" && !req.inviteSentAt && (
                      <span className="text-[10px] text-warning">Email non envoyé</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {req.status === "pending" && (
                      <>
                        <form action={approveBetaRequest}>
                          <input type="hidden" name="requestId" value={req.id} />
                          <button
                            type="submit"
                            disabled={stats.remaining <= 0}
                            className="rounded-lg bg-success/10 px-3 py-1 text-xs font-medium text-success hover:bg-success/20 transition-colors disabled:opacity-50"
                          >
                            Approuver
                          </button>
                        </form>
                        <form action={rejectBetaRequest}>
                          <input type="hidden" name="requestId" value={req.id} />
                          <button
                            type="submit"
                            className="rounded-lg bg-danger/10 px-3 py-1 text-xs font-medium text-danger hover:bg-danger/20 transition-colors"
                          >
                            Refuser
                          </button>
                        </form>
                        <DeleteButton requestId={req.id} />
                      </>
                    )}
                    {req.status === "approved" && (
                      <div className="flex items-center gap-2">
                        {req.inviteToken && (
                          <button
                            type="button"
                            onClick={() => copyInviteLink(req.id, req.inviteToken!)}
                            className="rounded-lg bg-accent/10 px-3 py-1 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
                          >
                            {copiedId === req.id ? "Copié !" : "Copier le lien"}
                          </button>
                        )}
                        <form action={revokeBetaAccess}>
                          <input type="hidden" name="requestId" value={req.id} />
                          <button
                            type="submit"
                            className="rounded-lg bg-danger/10 px-3 py-1 text-xs font-medium text-danger hover:bg-danger/20 transition-colors"
                          >
                            Révoquer
                          </button>
                        </form>
                        <DeleteButton requestId={req.id} />
                      </div>
                    )}
                    {req.status === "rejected" && (
                      <div className="flex items-center gap-2">
                        <form action={approveBetaRequest}>
                          <input type="hidden" name="requestId" value={req.id} />
                          <button
                            type="submit"
                            disabled={stats.remaining <= 0}
                            className="rounded-lg bg-success/10 px-3 py-1 text-xs font-medium text-success hover:bg-success/20 transition-colors disabled:opacity-50"
                          >
                            Ré-approuver
                          </button>
                        </form>
                        <DeleteButton requestId={req.id} />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeleteButton({ requestId }: { requestId: string }) {
  return (
    <form
      action={deleteBetaRequest}
      onSubmit={(e) => {
        if (!confirm("Supprimer définitivement cette demande ?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="requestId" value={requestId} />
      <button
        type="submit"
        className="rounded-lg bg-danger/10 px-3 py-1 text-xs font-medium text-danger hover:bg-danger/20 transition-colors"
      >
        Supprimer
      </button>
    </form>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-4">
      <p className="text-xs font-medium text-text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color ?? "text-foreground"}`}>{value}</p>
    </div>
  );
}
