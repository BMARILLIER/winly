export const metadata = {
  title: "Politique de confidentialité — Winly",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-foreground">
      <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
      <p className="mt-2 text-sm text-text-muted">
        Dernière mise à jour : avril 2026
      </p>

      <section className="mt-8 space-y-4 text-sm leading-relaxed text-text-secondary">
        <h2 className="text-lg font-semibold text-foreground">
          1. Données collectées
        </h2>
        <p>
          Winly collecte uniquement les données nécessaires au fonctionnement du
          service : email, nom, mot de passe chiffré, préférences de workspace,
          idées de contenu, et si l&apos;utilisateur connecte son compte Instagram,
          les métriques publiques de son profil professionnel (followers, médias,
          insights).
        </p>

        <h2 className="text-lg font-semibold text-foreground">
          2. Utilisation des données
        </h2>
        <p>
          Les données servent uniquement à fournir les fonctionnalités de Winly
          (score créateur, recommandations, génération de contenu). Aucune donnée
          n&apos;est revendue à des tiers.
        </p>

        <h2 className="text-lg font-semibold text-foreground">
          3. Données Instagram
        </h2>
        <p>
          Si vous connectez Instagram, Winly stocke un token d&apos;accès chiffré
          et des snapshots de vos métriques pour suivre l&apos;évolution dans le
          temps. Vous pouvez révoquer l&apos;accès à tout moment depuis les
          paramètres Instagram de votre compte ou depuis Winly &gt; Paramètres.
        </p>

        <h2 className="text-lg font-semibold text-foreground">
          4. Conservation
        </h2>
        <p>
          Vos données sont conservées tant que votre compte est actif. Vous
          pouvez demander leur suppression en contactant l&apos;équipe ou en
          supprimant votre compte depuis les paramètres.
        </p>

        <h2 className="text-lg font-semibold text-foreground">
          5. Sécurité
        </h2>
        <p>
          Les mots de passe sont hashés avec bcrypt (cost 12). Les tokens
          Instagram sont chiffrés en AES-256-CBC. La session est signée par HMAC
          SHA-256.
        </p>

        <h2 className="text-lg font-semibold text-foreground">
          6. Contact
        </h2>
        <p>
          Pour toute demande relative à vos données : barbara.crowft@gmail.com
        </p>
      </section>
    </div>
  );
}
