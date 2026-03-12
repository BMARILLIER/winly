import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ContentDeleteButton } from "./ContentDeleteButton";

export default async function AdminContentPage() {
  await requireAdmin();
  const [
    totalIdeas,
    statusCounts,
    topUsers,
    platformCounts,
    recentContent,
  ] = await Promise.all([
    prisma.contentIdea.count(),
    prisma.contentIdea.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.workspace.findMany({
      select: {
        name: true,
        mainPlatform: true,
        user: { select: { email: true } },
        _count: { select: { contentIdeas: true } },
      },
      orderBy: { contentIdeas: { _count: "desc" } },
      take: 5,
    }),
    prisma.workspace.groupBy({
      by: ["mainPlatform"],
      _count: { id: true },
    }),
    prisma.contentIdea.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        workspace: {
          select: { name: true, user: { select: { email: true } } },
        },
      },
    }),
  ]);

  const statusMap = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count.id])
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Contenu</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        {[
          { label: "Total", value: totalIdeas },
          { label: "Idées", value: statusMap["idea"] || 0 },
          { label: "Brouillons", value: statusMap["draft"] || 0 },
          { label: "Prêt", value: statusMap["ready"] || 0 },
          { label: "Publié", value: statusMap["published"] || 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-surface-1 p-4">
            <p className="text-sm text-text-secondary">{s.label}</p>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Top utilisateurs par contenu
        </h2>
        <div className="overflow-hidden rounded-lg border bg-surface-1">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-surface-2">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">Utilisateur</th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Workspace
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Plateforme
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Contenu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {topUsers.map((w) => (
                <tr key={w.name}>
                  <td className="px-4 py-3">{w.user.email}</td>
                  <td className="px-4 py-3">{w.name}</td>
                  <td className="px-4 py-3 capitalize">{w.mainPlatform}</td>
                  <td className="px-4 py-3 text-center">
                    {w._count.contentIdeas}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Contenu récent
        </h2>
        <div className="overflow-hidden rounded-lg border bg-surface-1">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-surface-2">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">Titre</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Statut</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Utilisateur</th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Créé le
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentContent.map((c) => (
                <tr key={c.id}>
                  <td className="max-w-xs truncate px-4 py-3 font-medium">
                    {c.title}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-surface-2 px-2 py-0.5 text-xs capitalize">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {c.workspace.user.email}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {c.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <ContentDeleteButton contentId={c.id} />
                  </td>
                </tr>
              ))}
              {recentContent.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-text-secondary"
                  >
                    Aucun contenu pour le moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
