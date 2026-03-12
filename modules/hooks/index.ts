// ---------------------------------------------------------------------------
// Hook Generator Engine
// Generates opening hooks by type, contextualised to niche and platform
// ---------------------------------------------------------------------------

export interface HookType {
  id: string;
  label: string;
  description: string;
  color: string; // tailwind badge classes
}

export const HOOK_TYPES: HookType[] = [
  { id: "curiosity", label: "Curiosité", description: "Créez une boucle ouverte que le lecteur doit refermer", color: "bg-purple-100 text-purple-700" },
  { id: "storytelling", label: "Storytelling", description: "Commencez par une histoire personnelle ou identifiable", color: "bg-blue-100 text-blue-700" },
  { id: "educational", label: "Éducatif", description: "Promettez un enseignement ou une leçon claire", color: "bg-green-100 text-green-700" },
  { id: "controversial", label: "Controversé", description: "Remettez en question une croyance courante pour susciter le débat", color: "bg-red-100 text-red-700" },
  { id: "statistical", label: "Statistique", description: "Commencez par un chiffre ou une donnée surprenante", color: "bg-amber-100 text-amber-700" },
];

export interface GeneratedHook {
  text: string;
  type: string;
}

// ---- Hook templates per type ----
// Each template is a function (niche) => string

const HOOK_TEMPLATES: Record<string, ((niche: string) => string)[]> = {
  curiosity: [
    (n) => `La plupart des gens en ${n} font cette erreur — et ils ne le savent même pas.`,
    (n) => `J'ai découvert quelque chose sur ${n} qui a tout changé pour moi.`,
    (n) => `Il existe une stratégie ${n} dont personne ne parle. La voici.`,
    (n) => `Et si tout ce que vous savez sur ${n} était faux ?`,
    (n) => `Je vais vous révéler le secret ${n} qu'il m'a fallu 2 ans à comprendre.`,
    (n) => `La raison n°1 pour laquelle vous ne progressez pas en ${n} ? Ce n'est pas ce que vous croyez.`,
    (n) => `J'ai testé 10 stratégies ${n}. Une seule a vraiment fonctionné.`,
    (n) => `Arrêtez de scroller. Ce conseil ${n} va vous faire gagner des mois d'essais et erreurs.`,
  ],
  storytelling: [
    (n) => `Il y a 6 mois, j'ai failli tout abandonner en ${n}. Voici ce qui s'est passé ensuite.`,
    (n) => `J'ai commencé ${n} avec zéro abonné et zéro expérience. Voici mon histoire.`,
    (n) => `La pire erreur que j'ai faite en ${n} m'a appris la meilleure leçon.`,
    (n) => `"Tu n'y arriveras jamais en ${n}." C'est ce qu'on m'a dit.`,
    (n) => `L'année dernière, un seul post ${n} a tout changé pour moi. Laissez-moi vous expliquer.`,
    (n) => `J'étais fauché, épuisé et prêt à lâcher ${n}. Et puis c'est arrivé.`,
    (n) => `Ma première tentative en ${n} a été un désastre. Voici ce que j'ai appris.`,
    (n) => `Un inconnu m'a envoyé un DM à propos de ${n}. Ce qu'il m'a dit m'a sidéré.`,
  ],
  educational: [
    (n) => `Voici 5 règles ${n} que j'aurais aimé apprendre plus tôt.`,
    (n) => `Le guide du débutant en ${n} — en 60 secondes.`,
    (n) => `3 frameworks ${n} qui fonctionnent vraiment (résultats à l'appui).`,
    (n) => `Comment progresser en ${n} — même si vous partez de zéro.`,
    (n) => `L'antisèche ${n} que personne ne vous a donnée. Jusqu'à maintenant.`,
    (n) => `Tout ce que je sais sur ${n}, expliqué simplement.`,
    (n) => `Conseil ${n} : faites ceci chaque jour et observez ce qui se passe en 30 jours.`,
    (n) => `J'étudie ${n} depuis des années. Voici les 3 choses qui comptent vraiment.`,
  ],
  controversial: [
    (n) => `Opinion impopulaire : la plupart des conseils ${n} sur internet sont nuls.`,
    (n) => `Avis tranché : vous n'avez pas besoin de publier tous les jours pour réussir en ${n}.`,
    (n) => `Tout le monde dit ça sur ${n}. Je ne suis absolument pas d'accord.`,
    (n) => `L'industrie du ${n} ne veut pas que vous sachiez ça.`,
    (n) => `Je vais me faire détester pour ça, mais ${n} n'est pas ce que vous croyez.`,
    (n) => `Arrêtez de copier les autres créateurs ${n}. Ça tue votre croissance.`,
    (n) => `Le plus gros mensonge en ${n} ? "Soyez juste régulier." Voici la vérité.`,
    (n) => `Les gourous ${n} ne vous diront jamais ça parce que ça nuit à leur business.`,
  ],
  statistical: [
    (n) => `80 % des créateurs ${n} abandonnent dans les 90 premiers jours. Voici pourquoi.`,
    (n) => `Seulement 3 % des comptes ${n} gagnent vraiment de l'argent. Faites partie des 3 %.`,
    (n) => `Je suis passé de 0 à 10K en ${n} en 6 mois. Voici le détail.`,
    (n) => `Les posts ${n} avec des hooks obtiennent 3x plus d'engagement. En voici 5 qui marchent.`,
    (n) => `J'ai analysé 100 comptes ${n}. Le top 1 % fait tous cette chose.`,
    (n) => `Le créateur ${n} moyen passe 4 heures sur un contenu qui obtient 12 likes. Corrigez ça.`,
    (n) => `7 abonnés ${n} sur 10 ne voient jamais vos posts. Voici comment y remédier.`,
    (n) => `Après 365 jours de contenu ${n}, voici mes vrais chiffres.`,
  ],
};

/**
 * Generate hooks of a specific type (or all types) for a given niche.
 */
export function generateHooks(
  niche: string,
  type: string | null,
  count: number = 5
): GeneratedHook[] {
  const types = type ? [type] : HOOK_TYPES.map((t) => t.id);
  const results: GeneratedHook[] = [];

  for (const t of types) {
    const templates = HOOK_TEMPLATES[t] ?? [];
    for (const tpl of templates) {
      results.push({ text: tpl(niche), type: t });
    }
  }

  // Shuffle
  const seed = niche.length + (type?.length ?? 0);
  const shuffled = results.sort((a, b) => {
    const ha = simpleHash(a.text + seed);
    const hb = simpleHash(b.text + seed);
    return ha - hb;
  });

  return shuffled.slice(0, count);
}

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return h;
}
