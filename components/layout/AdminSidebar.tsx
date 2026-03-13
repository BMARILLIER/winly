"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  ClipboardCheck,
  Database,
  Cpu,
  ScrollText,
  FlaskConical,
  Settings,
  ArrowLeft,
  ShieldCheck,
  Instagram,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const adminNavItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/workspaces", label: "Workspaces", icon: Building2 },
  { href: "/admin/content", label: "Contenu", icon: FileText },
  { href: "/admin/audits", label: "Audits", icon: ClipboardCheck },
  { href: "/admin/datasets", label: "Datasets", icon: Database },
  { href: "/admin/engines", label: "Moteurs", icon: Cpu },
  { href: "/admin/logs", label: "Journaux", icon: ScrollText },
  { href: "/admin/beta", label: "Bêta", icon: ShieldCheck },
  { href: "/admin/sandbox", label: "Sandbox", icon: FlaskConical },
  { href: "/admin/instagram", label: "Instagram", icon: Instagram },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-surface-1">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/admin" className="text-xl font-bold">
          <span className="bg-gradient-to-r from-primary via-violet to-cyan bg-clip-text text-transparent">
            WINLY
          </span>
          <span className="ml-2 text-sm font-normal text-text-muted">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {adminNavItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-accent-muted text-accent"
                  : "text-text-secondary hover:bg-surface-2 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-primary/10 to-violet/10 border border-accent/30 px-3 py-2.5 text-sm font-medium text-accent hover:from-primary/20 hover:to-violet/20 hover:border-accent/50 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Vue utilisateur
        </Link>
      </div>
    </aside>
  );
}
