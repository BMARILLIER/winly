"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Command Center" },
  { href: "/dashboard/overview", label: "Overview" },
  { href: "/dashboard/insights", label: "Insights" },
  { href: "/dashboard/opportunities", label: "Opportunities" },
  { href: "/dashboard/market-intelligence", label: "Market Intel" },
  { href: "/dashboard/radar", label: "Radar" },
  { href: "/dashboard/report", label: "Report" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <nav className="mb-6 flex gap-1 rounded-lg bg-surface-2 p-1">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
              pathname === tab.href
                ? "bg-surface-1 text-foreground shadow-sm-dark"
                : "text-text-secondary hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
