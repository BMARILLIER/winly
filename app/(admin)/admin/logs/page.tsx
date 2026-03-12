import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  "user.role.update": { label: "Changement de rôle", color: "bg-info/15 text-info" },
  "user.delete": { label: "Utilisateur supprimé", color: "bg-danger/15 text-danger" },
  "workspace.delete": { label: "Workspace supprimé", color: "bg-danger/15 text-danger" },
  "content.delete": { label: "Contenu supprimé", color: "bg-danger/15 text-danger" },
  "setting.update": { label: "Paramètre modifié", color: "bg-warning/15 text-warning" },
};

function getActionInfo(action: string) {
  return ACTION_LABELS[action] ?? { label: action, color: "bg-surface-2 text-foreground" };
}

export default async function AdminLogsPage() {
  await requireAdmin();

  const [logs, totalLogs] = await Promise.all([
    prisma.adminLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        admin: { select: { email: true } },
      },
    }),
    prisma.adminLog.count(),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Journaux d'activité</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {totalLogs} actions enregistrées au total
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-lg border bg-surface-1 p-8 text-center text-sm text-text-secondary">
          Aucune action admin enregistrée.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-surface-1">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-surface-2">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">Date</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Admin</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Action</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Cible</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => {
                const actionInfo = getActionInfo(log.action);
                const details = log.details ? JSON.parse(log.details) : null;

                return (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                      {log.createdAt.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-foreground">{log.admin.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${actionInfo.color}`}
                      >
                        {actionInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                      {log.target ?? "—"}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-xs text-text-secondary">
                      {details ? (
                        <span title={JSON.stringify(details, null, 2)}>
                          {Object.entries(details)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
