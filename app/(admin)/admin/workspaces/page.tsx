import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { DeleteButton } from "./DeleteButton";

export default async function AdminWorkspacesPage() {
  await requireAdmin();
  const workspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true } },
      _count: {
        select: { contentIdeas: true, savedHooks: true, socialProfiles: true },
      },
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Workspaces</h1>

      <div className="overflow-hidden rounded-lg border bg-surface-1">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-surface-2">
            <tr>
              <th className="px-4 py-3 font-medium text-text-secondary">Nom</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Propriétaire</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Plateforme</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Niche</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Contenu</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Créé le</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {workspaces.map((ws) => (
              <tr key={ws.id}>
                <td className="px-4 py-3 font-medium">{ws.name}</td>
                <td className="px-4 py-3 text-text-secondary">{ws.user.email}</td>
                <td className="px-4 py-3 capitalize">{ws.mainPlatform}</td>
                <td className="px-4 py-3 capitalize">{ws.niche}</td>
                <td className="px-4 py-3 text-center">
                  {ws._count.contentIdeas}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {ws.createdAt.toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <DeleteButton workspaceId={ws.id} />
                </td>
              </tr>
            ))}
            {workspaces.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                  Aucun workspace pour le moment
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
