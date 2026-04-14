import { Sidebar } from "@/components/layout/Sidebar";
import { AIAssistant } from "@/components/ui/ai-assistant";
import { HelpSystem } from "@/components/help/HelpSystem";
import { ProgressBadge } from "@/components/layout/ProgressBadge";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { Search } from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={user?.role} />
      <div className="flex-1 min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface-1 px-4 sm:px-8">
          <div className="flex items-center gap-4">
            {/* Spacer for mobile burger button */}
            <div className="w-10 lg:hidden" aria-hidden="true" />
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="rounded-lg border border-border bg-surface-2 py-1.5 pl-9 pr-4 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none w-48 lg:w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile search button */}
            <button className="rounded-lg p-2 text-text-secondary hover:bg-surface-2 hover:text-foreground transition-colors sm:hidden">
              <Search className="h-4 w-4" />
            </button>
            {user && <ProgressBadge userId={user.id} />}
            {user && <NotificationBell userId={user.id} />}
            <HelpSystem />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-violet flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span className="hidden sm:inline text-sm text-text-secondary">
                {user?.name ?? "User"}
              </span>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="hidden sm:inline-flex rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-2 hover:text-foreground transition-colors cursor-pointer"
              >
                D&eacute;connexion
              </button>
            </form>
          </div>
        </header>
        <main className="p-4 sm:p-8 animate-fade-in">{children}</main>
      </div>
      <AIAssistant />
    </div>
  );
}
