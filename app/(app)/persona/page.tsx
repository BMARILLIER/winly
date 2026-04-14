import { PersonaForm } from "./persona-form";

export default function PersonaPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Crée ton persona anonyme
        </h1>
        <p className="mt-2 text-text-secondary">
          Décris ton univers et Winly génère un alter ego complet — nom, bio,
          style, catchphrase — prêt à publier.
        </p>
      </div>

      <PersonaForm />
    </div>
  );
}
