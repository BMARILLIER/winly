import { PricingHero } from "@/components/pricing/PricingHero";
import { PricingCards } from "@/components/pricing/PricingCards";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { PricingCTA } from "@/components/pricing/PricingCTA";

export const metadata = {
  title: "Tarifs — Winly",
  description: "D\u00e9couvrez les plans Winly adapt\u00e9s \u00e0 votre croissance sur les r\u00e9seaux sociaux.",
};

export default function PricingPage() {
  return (
    <div>
      <PricingHero />
      <PricingCards />
      <ComparisonTable />
      <PricingFAQ />
      <PricingCTA />
    </div>
  );
}
