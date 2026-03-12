"use client";

import { HelpCircle } from "lucide-react";

interface HelpButtonProps {
  onClick: () => void;
}

export function HelpButton({ onClick }: HelpButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-2 text-text-secondary transition-colors hover:border-accent/40 hover:text-accent hover:bg-surface-3"
      aria-label="Ouvrir l'aide"
      title="Aide"
    >
      <HelpCircle className="h-4 w-4" />
    </button>
  );
}
