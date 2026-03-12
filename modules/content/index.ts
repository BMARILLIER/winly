// ---------------------------------------------------------------------------
// Content Ideas Engine
// Generates contextual content ideas based on platform, niche, and goals
// ---------------------------------------------------------------------------

export const FORMATS = [
  { id: "carousel", label: "Carrousel" },
  { id: "reel", label: "Reel / Vidéo courte" },
  { id: "single_image", label: "Image unique" },
  { id: "text", label: "Post texte" },
  { id: "story", label: "Story" },
  { id: "thread", label: "Thread" },
  { id: "live", label: "Live" },
] as const;

export const STATUSES = [
  { id: "idea", label: "Idée", color: "bg-gray-100 text-gray-700" },
  { id: "draft", label: "Brouillon", color: "bg-amber-100 text-amber-700" },
  { id: "ready", label: "Prêt", color: "bg-blue-100 text-blue-700" },
  { id: "published", label: "Publié", color: "bg-green-100 text-green-700" },
] as const;

export interface GeneratedIdea {
  title: string;
  hook: string;
  format: string;
  caption: string;
  cta: string;
}

// ---- Templates per platform ----

interface IdeaTemplate {
  title: (niche: string) => string;
  hook: (niche: string) => string;
  format: string;
  caption: (niche: string) => string;
  cta: string;
  platforms: string[]; // which platforms this works for
}

const TEMPLATES: IdeaTemplate[] = [
  // --- Universel ---
  {
    title: (n) => `3 erreurs en ${n}`,
    hook: (n) => `La plupart des gens en ${n} se trompent. Voici 3 erreurs à éviter.`,
    format: "carousel",
    caption: (n) => `Je vois ces erreurs en ${n} tout le temps. Faites défiler pour voir si vous les faites — et comment les corriger.`,
    cta: "Sauvegardez pour plus tard et partagez avec quelqu'un qui en a besoin.",
    platforms: ["instagram", "linkedin", "tiktok"],
  },
  {
    title: (n) => `Ma routine ${n} expliquée`,
    hook: (n) => `Voici exactement comment j'aborde ${n} — étape par étape.`,
    format: "reel",
    caption: (n) => `On me pose souvent des questions sur mon processus ${n}. Voici un aperçu rapide de ce que je fais vraiment.`,
    cta: "Abonnez-vous pour plus de contenu en coulisses.",
    platforms: ["instagram", "tiktok", "youtube"],
  },
  {
    title: (n) => `Guide du débutant en ${n}`,
    hook: (n) => `Nouveau en ${n} ? Commencez ici. C'est tout ce que j'aurais aimé savoir au jour 1.`,
    format: "carousel",
    caption: (n) => `Que vous débutiez en ${n} ou que vous cherchiez à progresser, ces fondamentaux vous aideront.`,
    cta: "Sauvegardez et revenez-y chaque fois que vous avez besoin d'un rappel.",
    platforms: ["instagram", "linkedin", "twitter"],
  },
  {
    title: (n) => `${n} : mythe vs réalité`,
    hook: (n) => `Les gens pensent que ${n} fonctionne comme ça… mais la vérité est complètement différente.`,
    format: "reel",
    caption: (n) => `Il est temps de casser quelques mythes sur ${n}. Lequel vous a le plus surpris ?`,
    cta: "Commentez avec un mythe que vous avez entendu — je le démonte.",
    platforms: ["instagram", "tiktok", "youtube"],
  },
  {
    title: (n) => `Un conseil ${n} qui a tout changé`,
    hook: (n) => `Ce simple conseil en ${n} a complètement transformé mes résultats.`,
    format: "text",
    caption: (n) => `J'ai essayé des dizaines de stratégies ${n}, mais ce seul changement a fait la plus grande différence. Voici ce qui s'est passé…`,
    cta: "Laissez un commentaire si vous avez vécu quelque chose de similaire.",
    platforms: ["twitter", "linkedin"],
  },
  {
    title: (n) => `Les outils ${n} que j'utilise au quotidien`,
    hook: (n) => `Voici les outils ${n} dont je ne peux pas me passer.`,
    format: "carousel",
    caption: (n) => `Après avoir testé des dizaines d'options, voici mes outils ${n} préférés. Chacun me fait gagner des heures chaque semaine.`,
    cta: "Sauvegardez cette liste et essayez-en un cette semaine.",
    platforms: ["instagram", "linkedin", "twitter"],
  },
  {
    title: (n) => `Une journée type : édition ${n}`,
    hook: (n) => `Vous vous demandez à quoi ressemble une journée type en ${n} ? Laissez-moi vous montrer.`,
    format: "reel",
    caption: (n) => `Du matin au soir — voici comment je passe mon temps à travailler sur ${n}.`,
    cta: "Abonnez-vous pour voir plus de contenu authentique et sans filtre.",
    platforms: ["instagram", "tiktok", "youtube"],
  },
  {
    title: (n) => `La question n°1 qu'on me pose sur ${n}`,
    hook: (n) => `Tout le monde me pose cette question sur ${n}. Voici ma réponse honnête.`,
    format: "text",
    caption: (n) => `J'ai répondu à cette question sur ${n} des centaines de fois, alors je la mets ici une bonne fois pour toutes.`,
    cta: "Quelle question aimeriez-vous que je traite ? Écrivez-la ci-dessous.",
    platforms: ["twitter", "linkedin", "instagram"],
  },
  {
    title: (n) => `${n} : avant et après`,
    hook: (n) => `La transformation est réelle. Voici mon parcours ${n}.`,
    format: "single_image",
    caption: (n) => `Où j'ai commencé vs où j'en suis maintenant en ${n}. La différence clé ? La régularité et la bonne stratégie.`,
    cta: "Partagez votre propre avant/après dans les commentaires.",
    platforms: ["instagram", "linkedin"],
  },
  {
    title: (n) => `Avis tranché sur ${n}`,
    hook: (n) => `Opinion impopulaire : la plupart des conseils en ${n} sont faux. Voici pourquoi.`,
    format: "thread",
    caption: (n) => `Je sais que c'est peut-être controversé, mais écoutez-moi. La façon dont la plupart des gens abordent ${n} est fondamentalement erronée.`,
    cta: "D'accord ou pas d'accord ? Répondez avec votre avis.",
    platforms: ["twitter", "linkedin"],
  },
  {
    title: (n) => `5 idées ${n} pour cette semaine`,
    hook: (n) => `En panne d'inspiration ? Voici 5 idées de contenu ${n} à utiliser tout de suite.`,
    format: "carousel",
    caption: (n) => `Blocage créatif ? Je vous aide. Voici 5 idées de posts ${n} qui ont fait leurs preuves — choisissez-en une et publiez-la aujourd'hui.`,
    cta: "Sauvegardez pour les jours où vous manquez d'idées.",
    platforms: ["instagram", "tiktok", "linkedin"],
  },
  {
    title: (n) => `FAQ : vos questions ${n}`,
    hook: (n) => `Vous avez demandé, je réponds. Parlons ${n}.`,
    format: "live",
    caption: (n) => `Je passe en live pour répondre à vos principales questions sur ${n}. Posez les vôtres dans les commentaires et j'en traiterai un maximum.`,
    cta: "Activez les notifications pour ne pas manquer le prochain live.",
    platforms: ["instagram", "tiktok", "youtube"],
  },
];

/**
 * Generate a batch of content ideas for a given niche + platform.
 * Returns up to `count` ideas, filtered by platform compatibility.
 */
export function generateIdeas(
  niche: string,
  platform: string,
  count: number = 5
): GeneratedIdea[] {
  const compatible = TEMPLATES.filter((t) =>
    t.platforms.includes(platform)
  );

  // Shuffle deterministically but vary by niche
  const seed = niche.length + platform.length;
  const shuffled = [...compatible].sort(
    (a, b) => {
      const ha = hashStr(a.title("") + seed);
      const hb = hashStr(b.title("") + seed);
      return ha - hb;
    }
  );

  return shuffled.slice(0, count).map((t) => ({
    title: t.title(niche),
    hook: t.hook(niche),
    format: t.format,
    caption: t.caption(niche),
    cta: t.cta,
  }));
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return h;
}
