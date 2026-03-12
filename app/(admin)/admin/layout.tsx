import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AIAssistant } from "@/components/ui/ai-assistant";
import { logout } from "@/lib/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface-1 px-8">
          <h2 className="text-sm font-semibold text-foreground">Panneau Admin</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">{user.email}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg px-4 py-1.5 text-sm text-text-secondary hover:bg-surface-2 hover:text-foreground transition-colors cursor-pointer"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </header>
        <main className="p-8 animate-fade-in">{children}</main>
      </div>
      <AIAssistant />
    </div>
  );
}
