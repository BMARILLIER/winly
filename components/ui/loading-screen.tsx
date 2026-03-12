"use client";

import { WinlyLogo } from "./winly-logo";

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-background">
      <div className="animate-pulse-slow">
        <WinlyLogo size="lg" glow />
      </div>
      <p className="text-sm font-medium text-text-muted animate-pulse">
        Chargement...
      </p>
    </div>
  );
}
