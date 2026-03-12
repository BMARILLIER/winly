import { Hero } from "@/components/how-it-works/Hero";
import { Steps } from "@/components/how-it-works/Steps";
import { Features } from "@/components/how-it-works/Features";
import { TargetUsers } from "@/components/how-it-works/TargetUsers";
import { CTA } from "@/components/how-it-works/CTA";
import { UserGuide } from "@/components/how-it-works/UserGuide";

export const metadata = {
  title: "Comment fonctionne Winly",
  description:
    "Découvrez comment Winly analyse vos réseaux sociaux et vous aide à améliorer votre croissance.",
};

export default function HowItWorksPage() {
  return (
    <div>
      <Hero />
      <Steps />
      <UserGuide />
      <Features />
      <TargetUsers />
      <CTA />
    </div>
  );
}
