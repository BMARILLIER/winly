import type { PillarResult } from "@/modules/score";

// ---------------------------------------------------------------------------
// Action Plan Engine
// Generates prioritized actions from Score pillar results + workspace config
// ---------------------------------------------------------------------------

export interface Action {
  id: string;
  title: string;
  description: string;
  pillar: string;      // pillarId source
  pillarLabel: string;
  priority: "high" | "medium" | "low";
  effort: "quick" | "medium" | "ongoing";
}

export interface ActionPlan {
  actions: Action[];
  focusPillar: string;
  focusPillarLabel: string;
  createdAt: string;
}

// ---- Action catalogue per pillar, scored threshold ----
// Each pillar has actions for low (<40) and mid (<70) scores.
// High pillars (>=70) get no actions — they're fine.

interface ActionTemplate {
  id: string;
  title: string;
  description: string;
  threshold: number; // action generated if pillar score < threshold
  effort: "quick" | "medium" | "ongoing";
}

const ACTION_TEMPLATES: Record<string, ActionTemplate[]> = {
  profile: [
    {
      id: "profile_bio",
      title: "Réécrivez votre bio",
      description: "Rédigez une phrase claire : qui vous êtes, ce que vous faites, pour qui. Restez sous 150 caractères.",
      threshold: 70,
      effort: "quick",
    },
    {
      id: "profile_positioning",
      title: "Définissez votre positionnement unique",
      description: "Notez : votre niche + votre angle + ce qui vous différencie. Utilisez cela comme filtre pour tout votre contenu.",
      threshold: 70,
      effort: "medium",
    },
    {
      id: "profile_visual",
      title: "Créez un kit d'identité visuelle",
      description: "Choisissez 2-3 couleurs de marque, 1 style de police et un filtre ou template cohérent. Appliquez-les à tous vos nouveaux posts.",
      threshold: 50,
      effort: "medium",
    },
    {
      id: "profile_link",
      title: "Ajoutez un lien dans votre bio",
      description: "Configurez une page lien-en-bio (Linktree, Bento ou une landing page simple) et gardez-la à jour.",
      threshold: 70,
      effort: "quick",
    },
  ],
  content: [
    {
      id: "content_hooks",
      title: "Améliorez vos hooks",
      description: "Commencez chaque post par une première ligne percutante. Utilisez une question, une affirmation forte ou un chiffre. Testez 3 hooks différents cette semaine.",
      threshold: 70,
      effort: "ongoing",
    },
    {
      id: "content_formats",
      title: "Essayez un nouveau format de contenu",
      description: "Si vous ne publiez que des images, essayez un carrousel ou une courte vidéo. La variété augmente la portée et maintient l'engagement de votre audience.",
      threshold: 70,
      effort: "medium",
    },
    {
      id: "content_value",
      title: "Ajoutez plus de valeur par post",
      description: "Chaque post doit éduquer, inspirer ou divertir. Avant de publier, demandez-vous : est-ce que je sauvegarderais ceci si je le voyais ?",
      threshold: 50,
      effort: "ongoing",
    },
    {
      id: "content_niche",
      title: "Restez dans votre thématique",
      description: "Passez en revue vos 10 derniers posts. Supprimez ou réduisez le contenu hors sujet. Votre audience vous suit pour votre niche.",
      threshold: 50,
      effort: "quick",
    },
  ],
  consistency: [
    {
      id: "consistency_frequency",
      title: "Publiez 3 fois par semaine",
      description: "Choisissez 3 jours fixes (ex : lun/mer/ven) et engagez-vous à publier ces jours-là pendant les 4 prochaines semaines.",
      threshold: 70,
      effort: "ongoing",
    },
    {
      id: "consistency_schedule",
      title: "Définissez un calendrier de publication",
      description: "Choisissez vos jours et horaires de publication. Ajoutez-les à votre calendrier en tant qu'événements récurrents.",
      threshold: 70,
      effort: "quick",
    },
    {
      id: "consistency_batch",
      title: "Créez votre contenu par lots",
      description: "Consacrez une session par semaine à créer tous vos posts. Préparez les légendes, visuels et hashtags à l'avance.",
      threshold: 50,
      effort: "medium",
    },
    {
      id: "consistency_gaps",
      title: "Éliminez les trous de publication",
      description: "Gardez un stock de 3 à 5 posts prêts à publier pour ne jamais manquer un jour, même quand vous êtes occupé.",
      threshold: 50,
      effort: "medium",
    },
  ],
  engagement: [
    {
      id: "engagement_reply",
      title: "Répondez à chaque commentaire",
      description: "Réservez 15 minutes après chaque post pour répondre à tous les commentaires. Cela envoie un signal à l'algorithme et fidélise votre audience.",
      threshold: 70,
      effort: "ongoing",
    },
    {
      id: "engagement_interactive",
      title: "Créez du contenu interactif",
      description: "Publiez un sondage, une question ou un \"ceci ou cela\" au moins une fois par semaine. Ces formats boostent le taux d'engagement.",
      threshold: 70,
      effort: "ongoing",
    },
    {
      id: "engagement_community",
      title: "Interagissez avec 5 créateurs par jour",
      description: "Laissez des commentaires sincères et réfléchis sur 5 posts de créateurs de votre niche chaque jour. Cela augmente votre visibilité.",
      threshold: 50,
      effort: "ongoing",
    },
    {
      id: "engagement_conversations",
      title: "Terminez vos posts par une question",
      description: "Ajoutez une question ouverte à la fin de chaque post pour inviter la conversation dans les commentaires.",
      threshold: 70,
      effort: "quick",
    },
  ],
  conversion: [
    {
      id: "conversion_cta",
      title: "Ajoutez un CTA à chaque post",
      description: "Terminez chaque post par une action claire : sauvegarder, partager, commenter, s'abonner ou cliquer sur le lien. Alternez entre elles.",
      threshold: 70,
      effort: "ongoing",
    },
    {
      id: "conversion_funnel",
      title: "Mettez en place une capture de leads",
      description: "Créez un cadeau gratuit (checklist, template, guide) et mettez le lien dans votre bio pour collecter des emails.",
      threshold: 70,
      effort: "medium",
    },
    {
      id: "conversion_offers",
      title: "Promouvez votre offre chaque semaine",
      description: "Mentionnez votre produit, service ou lien d'affiliation au moins une fois par semaine. N'ayez pas peur de vendre.",
      threshold: 50,
      effort: "ongoing",
    },
    {
      id: "conversion_tracking",
      title: "Suivez vos résultats",
      description: "Configurez des liens UTM ou utilisez les analytics de la plateforme. Analysez les clics, sauvegardes et conversions chaque semaine.",
      threshold: 50,
      effort: "medium",
    },
  ],
};

// ---- Plan generator ----

export function generateActionPlan(
  pillars: PillarResult[]
): ActionPlan {
  // Sort pillars by impact potential: weight × (100 - score), descending
  const ranked = [...pillars].sort(
    (a, b) => b.weight * (100 - b.score) - a.weight * (100 - a.score)
  );

  const focusPillar = ranked[0];
  const actions: Action[] = [];

  for (const pillar of ranked) {
    const templates = ACTION_TEMPLATES[pillar.pillarId] ?? [];

    for (const tpl of templates) {
      if (pillar.score < tpl.threshold) {
        let priority: Action["priority"] = "low";
        if (pillar.score < 40) priority = "high";
        else if (pillar.score < 70) priority = "medium";

        actions.push({
          id: tpl.id,
          title: tpl.title,
          description: tpl.description,
          pillar: pillar.pillarId,
          pillarLabel: pillar.label,
          priority,
          effort: tpl.effort,
        });
      }
    }
  }

  return {
    actions,
    focusPillar: focusPillar.pillarId,
    focusPillarLabel: focusPillar.label,
    createdAt: new Date().toISOString(),
  };
}
