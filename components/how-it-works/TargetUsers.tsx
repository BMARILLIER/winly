import { UserCircle, Users, Briefcase, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const targets: { label: string; icon: LucideIcon }[] = [
  { label: "Cr\u00e9ateurs de contenu", icon: UserCircle },
  { label: "Community managers", icon: Users },
  { label: "Entrepreneurs", icon: Briefcase },
  { label: "Marques et petites entreprises", icon: Building2 },
];

export function TargetUsers() {
  return (
    <section className="border-y border-border bg-surface-1 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground">
          Pour qui est Winly
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {targets.map((t) => (
            <div
              key={t.label}
              className="flex items-center gap-2.5 rounded-full border border-border bg-surface-2 px-5 py-2.5 text-sm text-text-secondary transition-all duration-200 hover:border-border-hover hover:text-foreground"
            >
              <t.icon className="h-4 w-4 text-accent" />
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
