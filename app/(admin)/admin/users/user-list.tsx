"use client";

import { useState } from "react";
import { updateUserRole, deleteUser } from "@/lib/actions/admin";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  _count: { workspaces: number };
};

export function UserList({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Rechercher par email ou nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="all">Tous les rôles</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="team">Team</option>
          <option value="admin">Admin</option>
        </select>
        <span className="self-center text-xs text-text-secondary">
          {filtered.length} / {users.length} users
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border bg-surface-1">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-surface-2">
            <tr>
              <th className="px-4 py-3 font-medium text-text-secondary">Email</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Nom</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Rôle</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Inscrit le</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Workspaces</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {user.name || "—"}
                </td>
                <td className="px-4 py-3">
                  <form action={updateUserRole}>
                    <input type="hidden" name="userId" value={user.id} />
                    <select
                      name="role"
                      defaultValue={user.role}
                      onChange={(e) => e.target.form?.requestSubmit()}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      <option value="free">free</option>
                      <option value="pro">pro</option>
                      <option value="team">team</option>
                      <option value="admin">admin</option>
                    </select>
                  </form>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center">{user._count.workspaces}</td>
                <td className="px-4 py-3">
                  {user.id === currentUserId ? (
                    <span className="text-xs text-text-muted">Vous</span>
                  ) : confirmDelete === user.id ? (
                    <div className="flex gap-2">
                      <form action={deleteUser}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                          type="submit"
                          className="rounded bg-danger px-2 py-1 text-xs text-white hover:bg-danger/80"
                        >
                          Confirmer
                        </button>
                      </form>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="rounded border px-2 py-1 text-xs text-text-secondary hover:bg-surface-2"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(user.id)}
                      className="rounded border border-danger/30 px-2 py-1 text-xs text-danger hover:bg-danger/15"
                    >
                      Supprimer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-text-secondary">
            Aucun utilisateur ne correspond à votre recherche.
          </div>
        )}
      </div>
    </div>
  );
}
