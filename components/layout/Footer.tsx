import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-1 py-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-accent to-violet bg-clip-text text-transparent">
              Winly
            </span>
            <p className="mt-2 text-sm text-text-muted">
              Power Your Social Growth
            </p>
            <p className="mt-3 text-xs text-text-muted">
              Assistant IA pour les créateurs de contenu
            </p>
          </div>

          {/* Column 2: Produit */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Produit
            </h3>
            <nav className="flex flex-col">
              <Link
                href="/features"
                className="block py-1 text-sm text-text-secondary hover:text-foreground transition-colors"
              >
                Fonctionnalités
              </Link>
              <Link
                href="/pricing"
                className="block py-1 text-sm text-text-secondary hover:text-foreground transition-colors"
              >
                Tarifs
              </Link>
              <Link
                href="/how-it-works"
                className="block py-1 text-sm text-text-secondary hover:text-foreground transition-colors"
              >
                Comment ça marche
              </Link>
            </nav>
          </div>

          {/* Column 3: Ressources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Ressources
            </h3>
            <nav className="flex flex-col">
              <Link
                href="/how-it-works#guide"
                className="block py-1 text-sm text-text-secondary hover:text-foreground transition-colors"
              >
                Guide utilisateur
              </Link>
              <Link
                href="/beta"
                className="block py-1 text-sm text-text-secondary hover:text-foreground transition-colors"
              >
                Beta
              </Link>
              <a
                href="#"
                className="block py-1 text-sm text-text-secondary hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>

          {/* Column 4: Légal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Légal
            </h3>
            <nav className="flex flex-col">
              <a
                href="#"
                className="block py-1 text-sm text-text-secondary hover:text-foreground transition-colors"
              >
                Conditions d&apos;utilisation
              </a>
              <a
                href="#"
                className="block py-1 text-sm text-text-secondary hover:text-foreground transition-colors"
              >
                Politique de confidentialité
              </a>
              <a
                href="#"
                className="block py-1 text-sm text-text-secondary hover:text-foreground transition-colors"
              >
                Mentions légales
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-text-muted">
            &copy; 2025 Winly. Tous droits réservés.
          </p>
          <p className="text-xs text-text-muted">
            Made with ♥ for creators
          </p>
        </div>
      </div>
    </footer>
  );
}
