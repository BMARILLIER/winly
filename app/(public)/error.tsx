"use client";

import { useEffect } from "react";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Winly Public Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-4xl font-bold bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent">
        WINLY
      </div>
      <h2 className="mb-2 text-xl font-semibold text-foreground">
        Oups, une erreur est survenue
      </h2>
      <p className="mb-6 max-w-md text-sm text-text-secondary">
        La page que vous consultez a rencontré un problème. Veuillez réessayer
        ou retourner à l&apos;accueil.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-gradient-to-r from-primary to-violet px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 cursor-pointer"
        >
          Réessayer
        </button>
        <a
          href="/"
          className="rounded-lg border border-border bg-surface-1 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          Accueil
        </a>
      </div>
    </div>
  );
}
