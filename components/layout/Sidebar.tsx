"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import {
  LayoutDashboard,
  ClipboardCheck,
  Star,
  ListChecks,
  FileText,
  Anchor,
  Hash,
  Instagram,
  UserCircle,
  Recycle,
  Fingerprint,
  CalendarDays,
  MessageCircle,
  Radar,
  TrendingUp,
  Target,
  BarChart3,
  Award,
  Settings,
  BarChart2,
  Sprout,
  Lightbulb,
  Users,
  FileBarChart,
  LogOut,
  Shield,
  FlaskConical,
  Zap,
  TestTube,
  Gem,
  ChevronRight,
  Menu,
  X,
  DollarSign,
  Bell,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// --- Types ---

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DirectLink {
  type: "link";
  href: string;
  label: string;
  icon: LucideIcon;
}

interface CollapsibleGroup {
  type: "group";
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

type NavEntry = DirectLink | CollapsibleGroup;

// --- Navigation structure ---

const navEntries: NavEntry[] = [
  {
    type: "link",
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    type: "group",
    id: "audit-score",
    label: "Audit & Score",
    icon: ClipboardCheck,
    items: [
      { href: "/audit", label: "Audit", icon: ClipboardCheck },
      { href: "/score", label: "Score", icon: Star },
      { href: "/creator-score", label: "Creator Score", icon: Award },
    ],
  },
  {
    type: "group",
    id: "plan-progression",
    label: "Plan & Progression",
    icon: Target,
    items: [
      { href: "/action-plan", label: "Plan d\u2019action", icon: ListChecks },
      { href: "/missions", label: "Missions", icon: Target },
      { href: "/progress", label: "Progression", icon: BarChart3 },
    ],
  },
  {
    type: "link",
    href: "/revenue",
    label: "Revenue",
    icon: DollarSign,
  },
  {
    type: "link",
    href: "/deal-analyzer",
    label: "Deal Analyzer",
    icon: Scale,
  },
  {
    type: "group",
    id: "intelligence",
    label: "Intelligence",
    icon: Lightbulb,
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart2 },
      { href: "/ai-insights", label: "AI Insights", icon: Lightbulb },
      { href: "/growth", label: "Growth", icon: Sprout },
      { href: "/reports", label: "Rapports", icon: FileBarChart },
    ],
  },
  {
    type: "group",
    id: "radar-tendances",
    label: "Radar & Tendances",
    icon: Radar,
    items: [
      { href: "/radar", label: "Radar", icon: Radar },
      { href: "/trend-radar", label: "Trend Radar", icon: TrendingUp },
      { href: "/predict", label: "Pr\u00e9dicteur", icon: TrendingUp },
      { href: "/viral-score", label: "Viral Score", icon: Zap },
    ],
  },
  {
    type: "group",
    id: "creation",
    label: "Cr\u00e9ation",
    icon: FileText,
    items: [
      { href: "/content", label: "Contenu", icon: FileText },
      { href: "/content-lab", label: "Content Lab", icon: TestTube },
      { href: "/hooks", label: "Hooks", icon: Anchor },
      { href: "/hashtags", label: "Hashtags", icon: Hash },
      { href: "/bio", label: "Bio", icon: UserCircle },
      { href: "/repurpose", label: "Repurpose", icon: Recycle },
      { href: "/identity", label: "Mon identité", icon: Fingerprint },
    ],
  },
  {
    type: "link",
    href: "/calendar",
    label: "Calendrier",
    icon: CalendarDays,
  },
  {
    type: "link",
    href: "/coach",
    label: "Coach",
    icon: MessageCircle,
  },
  {
    type: "link",
    href: "/live-chat",
    label: "Live Chat",
    icon: Zap,
  },
  {
    type: "link",
    href: "/comments",
    label: "Commentaires IA",
    icon: MessageCircle,
  },
  {
    type: "group",
    id: "concurrents-opportunites",
    label: "Concurrents & Opportunit\u00e9s",
    icon: Users,
    items: [
      { href: "/competitors", label: "Concurrents", icon: Users },
      { href: "/opportunity-finder", label: "Opportunity Finder", icon: Gem },
      { href: "/growth-simulator", label: "Simulateur", icon: FlaskConical },
    ],
  },
];

// --- Helpers ---

function findGroupForPath(pathname: string): string | null {
  for (const entry of navEntries) {
    if (entry.type === "group") {
      for (const item of entry.items) {
        if (pathname === item.href || pathname.startsWith(item.href + "/")) {
          return entry.id;
        }
      }
    }
  }
  return null;
}

function isRouteActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

// --- Collapsible section component ---

function CollapsibleSection({
  entry,
  isExpanded,
  onToggle,
  pathname,
  onNavClick,
}: {
  entry: CollapsibleGroup;
  isExpanded: boolean;
  onToggle: () => void;
  pathname: string;
  onNavClick?: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [entry.items]);

  const hasActiveChild = entry.items.some((item) =>
    isRouteActive(pathname, item.href)
  );

  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer",
          hasActiveChild
            ? "text-accent"
            : "text-text-secondary hover:bg-surface-2 hover:text-foreground"
        )}
      >
        <entry.icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{entry.label}</span>
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            isExpanded && "rotate-90"
          )}
        />
      </button>
      <div
        className="overflow-hidden transition-[max-height] duration-200 ease-in-out"
        style={{ maxHeight: isExpanded ? `${height}px` : "0px" }}
      >
        <div
          ref={contentRef}
          className="ml-3 space-y-0.5 border-l border-border pl-2 pt-0.5 pb-1"
        >
          {entry.items.map((item) => {
            const isActive = isRouteActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-accent-muted text-accent border-l-2 border-accent"
                    : "text-text-secondary hover:bg-surface-2 hover:text-foreground"
                )}
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Sidebar content ---

function SidebarContent({
  role,
  pathname,
  onNavClick,
}: {
  role?: string;
  pathname: string;
  onNavClick?: () => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const activeGroup = findGroupForPath(pathname);
    return activeGroup ? new Set([activeGroup]) : new Set();
  });

  // Auto-expand group when route changes
  useEffect(() => {
    const activeGroup = findGroupForPath(pathname);
    if (activeGroup && !expanded.has(activeGroup)) {
      setExpanded((prev) => new Set(prev).add(activeGroup));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <>
      <div className="flex h-36 items-center justify-center border-b border-border py-4 px-4">
        <Link href="/dashboard" onClick={onNavClick}>
          <Image
            src="/branding/winly-icon.png"
            alt="Winly"
            width={400}
            height={120}
            className="object-contain h-28"
            priority
          />
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navEntries.map((entry) => {
          if (entry.type === "link") {
            const isActive = isRouteActive(pathname, entry.href);
            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={onNavClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-accent-muted text-accent border-l-2 border-accent"
                    : "text-text-secondary hover:bg-surface-2 hover:text-foreground"
                )}
              >
                <entry.icon className="h-4 w-4 shrink-0" />
                {entry.label}
              </Link>
            );
          }

          return (
            <CollapsibleSection
              key={entry.id}
              entry={entry}
              isExpanded={expanded.has(entry.id)}
              onToggle={() => toggleGroup(entry.id)}
              pathname={pathname}
              onNavClick={onNavClick}
            />
          );
        })}

        {/* Instagram + Settings at bottom of nav */}
        <div className="pt-2 mt-2 border-t border-border space-y-1">
          <Link
            href="/settings"
            onClick={onNavClick}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-pink-500/30 text-pink-400 hover:from-purple-500/20 hover:via-pink-500/20 hover:to-orange-500/20 transition-all duration-200"
          >
            <Instagram className="h-4 w-4 shrink-0" />
            Instagram
          </Link>
          <Link
            href="/settings"
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
              isRouteActive(pathname, "/settings")
                ? "bg-accent-muted text-accent border-l-2 border-accent"
                : "text-text-secondary hover:bg-surface-2 hover:text-foreground"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            Param&egrave;tres
          </Link>
        </div>
      </nav>
      {role === "admin" && (
        <div className="border-t border-border px-3 py-2">
          <Link
            href="/admin"
            onClick={onNavClick}
            className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-primary/10 to-violet/10 border border-accent/30 px-3 py-2.5 text-sm font-medium text-accent hover:from-primary/20 hover:to-violet/20 hover:border-accent/50 transition-all duration-200"
          >
            <Shield className="h-4 w-4" />
            Panneau Admin
          </Link>
        </div>
      )}
      <div className="border-t border-border p-3">
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-text-secondary hover:bg-surface-2 hover:text-foreground transition-all duration-150 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            D&eacute;connexion
          </button>
        </form>
      </div>
    </>
  );
}

// --- Main Sidebar export ---

export function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    if (mobileOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      {/* Mobile burger button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-surface-1 border border-border p-2 text-text-secondary hover:bg-surface-2 hover:text-foreground transition-colors lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay + sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "visible" : "invisible"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={closeMobile}
          aria-hidden="true"
        />
        {/* Sliding sidebar */}
        <aside
          className={cn(
            "relative flex h-full w-72 max-w-[85vw] flex-col bg-surface-1 shadow-2xl transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeMobile}
            className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-text-secondary hover:bg-surface-2 hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent
            role={role}
            pathname={pathname}
            onNavClick={closeMobile}
          />
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen w-64 flex-col border-r border-border bg-surface-1 shrink-0">
        <SidebarContent role={role} pathname={pathname} />
      </aside>
    </>
  );
}
