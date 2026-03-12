import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { UserList } from "./user-list";

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { workspaces: true } },
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Utilisateurs</h1>
      <UserList users={users} currentUserId={currentUser!.id} />
    </div>
  );
}
