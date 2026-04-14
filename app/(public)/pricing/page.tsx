import { PricingPlans } from "@/components/pricing/PricingPlans";

export const metadata = {
  title: "Tarifs — Winly",
  description:
    "Choisissez le plan Winly adapté à votre croissance sur les réseaux sociaux.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Tarifs Winly</h1>
        <p className="mt-3 text-muted-foreground">
          Commencez gratuitement. Passez en Pro quand vous êtes prêt à accélérer.
        </p>
      </div>
      <PricingPlans />
    </div>
  );
}
