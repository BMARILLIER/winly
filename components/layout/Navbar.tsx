"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-surface-1">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary via-violet to-cyan bg-clip-text text-transparent">
          Winly
        </Link>

        {/* Desktop nav links */}
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/features" className="text-sm text-text-secondary hover:text-foreground transition-colors">
            Fonctionnalit&eacute;s
          </Link>
          <Link href="/how-it-works" className="text-sm text-text-secondary hover:text-foreground transition-colors">
            Comment &ccedil;a marche
          </Link>
          <Link href="/pricing" className="text-sm text-text-secondary hover:text-foreground transition-colors">
            Tarifs
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Connexion
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="sm:hidden rounded-lg p-2 text-text-secondary hover:bg-surface-2 hover:text-foreground transition-colors"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={cn(
          "sm:hidden overflow-hidden transition-all duration-300 ease-out border-t border-border bg-surface-1",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-t-0"
        )}
      >
        <div className="flex flex-col gap-2 px-6 py-4">
          <Link
            href="/features"
            onClick={() => setOpen(false)}
            className="text-sm text-text-secondary hover:text-foreground transition-colors py-2"
          >
            Fonctionnalit&eacute;s
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setOpen(false)}
            className="text-sm text-text-secondary hover:text-foreground transition-colors py-2"
          >
            Comment &ccedil;a marche
          </Link>
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="text-sm text-text-secondary hover:text-foreground transition-colors py-2"
          >
            Tarifs
          </Link>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors text-center"
          >
            Connexion
          </Link>
        </div>
      </div>
    </nav>
  );
}
