// ---------------------------------------------------------------------------
// Growth Radar Module
// Detect content opportunities, generate viral angles, opportunity scoring
// ---------------------------------------------------------------------------

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  angle: string;
  score: number; // 0-100
  category: "trending" | "evergreen" | "seasonal" | "reactive" | "gap";
  urgency: "now" | "this_week" | "anytime";
  formats: string[];
}

interface RadarContext {
  platform: string;
  niche: string;
  goals: string[];
  profileType: string;
  postFrequency: string;
  existingTitles: string[];
}

// ---- Opportunity templates by niche keyword ----

interface OpportunityTemplate {
  nicheKeywords: string[];
  opportunities: Omit<Opportunity, "id">[];
}

const UNIVERSAL_OPPORTUNITIES: Omit<Opportunity, "id">[] = [
  {
    title: "Transformation avant / après",
    description: "Montrez une transformation claire : compétences, résultats, mode de vie. Les gens adorent voir des progrès visibles.",
    angle: "Documentez votre propre avant/après ou compilez des exemples de votre niche.",
    score: 85,
    category: "evergreen",
    urgency: "anytime",
    formats: ["carousel", "reel", "post"],
  },
  {
    title: "Post anti-mythes",
    description: "Démontez une idée reçue dans votre niche. Les prises de position controversées génèrent de l'engagement.",
    angle: "Commencez par '90 % des gens croient [mythe]... Voici la vérité.'",
    score: 82,
    category: "evergreen",
    urgency: "anytime",
    formats: ["carousel", "thread", "reel"],
  },
  {
    title: "Dans les coulisses",
    description: "Montrez votre processus, votre espace de travail ou votre routine quotidienne. L'authenticité crée la confiance.",
    angle: "Filmez un aperçu brut et non édité de la façon dont vous créez du contenu ou travaillez.",
    score: 75,
    category: "evergreen",
    urgency: "anytime",
    formats: ["reel", "story", "post"],
  },
  {
    title: "Avis tranché et controversé",
    description: "Partagez une opinion impopulaire dans votre niche. Le contenu polarisant est partagé.",
    angle: "Utilisez le format : 'Opinion impopulaire : [affirmation forte]. Voici pourquoi...'",
    score: 88,
    category: "reactive",
    urgency: "anytime",
    formats: ["post", "thread", "reel"],
  },
  {
    title: "Une journée dans ma vie",
    description: "Contenu vlog montrant votre routine quotidienne liée à votre niche.",
    angle: "Concentrez-vous sur les parties intéressantes/inattendues. Personne ne veut vous voir vous brosser les dents.",
    score: 70,
    category: "evergreen",
    urgency: "anytime",
    formats: ["reel", "video"],
  },
  {
    title: "Liste : les outils que j'utilise",
    description: "Partagez vos outils, apps ou ressources préférés. Ces contenus sont massivement sauvegardés et partagés.",
    angle: "Limitez-vous à 5-7 outils max. Incluez un choix inattendu.",
    score: 80,
    category: "evergreen",
    urgency: "anytime",
    formats: ["carousel", "thread", "post"],
  },
  {
    title: "Erreurs de débutant à éviter",
    description: "Listez 3-5 erreurs que font les débutants dans votre niche. Éducatif + identifiable.",
    angle: "Présentez-les comme des erreurs que VOUS avez faites, pas comme une leçon de morale.",
    score: 83,
    category: "evergreen",
    urgency: "anytime",
    formats: ["carousel", "thread", "reel"],
  },
  {
    title: "Comparatif : ceci vs cela",
    description: "Comparez deux options populaires dans votre niche. Les gens adorent les comparaisons claires.",
    angle: "Utilisez un format côte à côte. Donnez votre recommandation honnête à la fin.",
    score: 78,
    category: "evergreen",
    urgency: "anytime",
    formats: ["carousel", "post", "reel"],
  },
  {
    title: "Défi du week-end",
    description: "Lancez un mini-défi que votre audience peut faire pendant le week-end.",
    angle: "Rendez-le simple, réalisable et partageable. Créez un hashtag.",
    score: 72,
    category: "seasonal",
    urgency: "this_week",
    formats: ["post", "reel", "story"],
  },
  {
    title: "Répondre à un DM fréquent",
    description: "Prenez une question fréquemment posée en DM et répondez-y publiquement.",
    angle: "Faites une capture du DM (avec permission) ou paraphrasez-le. Cela montre que vous êtes impliqué.",
    score: 76,
    category: "reactive",
    urgency: "this_week",
    formats: ["reel", "post", "carousel"],
  },
];

const NICHE_TEMPLATES: OpportunityTemplate[] = [
  {
    nicheKeywords: ["fitness", "gym", "workout", "health", "sport"],
    opportunities: [
      {
        title: "Défi entraînement de 5 minutes",
        description: "Les entraînements rapides performent incroyablement bien. Faible barrière à l'entrée = fort engagement.",
        angle: "Filmez-vous en train de faire l'entraînement en temps réel. Ajoutez un chronomètre en overlay.",
        score: 90,
        category: "trending",
        urgency: "now",
        formats: ["reel", "video"],
      },
      {
        title: "Meal prep du dimanche",
        description: "Le contenu meal prep hebdomadaire est très sauvegardé et recherché.",
        angle: "Montrez tout le processus en timelapse. Listez les ingrédients dans la légende.",
        score: 85,
        category: "seasonal",
        urgency: "this_week",
        formats: ["reel", "carousel"],
      },
      {
        title: "Bilan de progression",
        description: "Partagez votre progression fitness avec des métriques précises. La transparence inspire.",
        angle: "Incluez des chiffres : poids, répétitions, temps. Montrez le travail, pas que les résultats.",
        score: 78,
        category: "evergreen",
        urgency: "anytime",
        formats: ["post", "reel"],
      },
    ],
  },
  {
    nicheKeywords: ["tech", "coding", "developer", "programming", "software", "ai"],
    opportunities: [
      {
        title: "Construire X en Y minutes",
        description: "Les tutoriels de construction rapide sont de l'or viral. Montrez ce qui est possible rapidement.",
        angle: "Choisissez un outil ou framework tendance. Restez sous 60 secondes pour les Reels/Shorts.",
        score: 92,
        category: "trending",
        urgency: "now",
        formats: ["reel", "video", "thread"],
      },
      {
        title: "Critique de code humoristique",
        description: "Passez en revue du mauvais code (le vôtre ou des exemples) avec humour. Éducatif + divertissant.",
        angle: "Utilisez l'écran partagé : mauvais code à gauche, votre correction à droite.",
        score: 86,
        category: "evergreen",
        urgency: "anytime",
        formats: ["reel", "carousel"],
      },
      {
        title: "L'outil dont personne ne parle",
        description: "Partagez un outil ou une librairie sous-estimée. Les gens adorent découvrir des pépites cachées.",
        angle: "Montrez un cas d'usage réel, pas juste la landing page. Démo > description.",
        score: 84,
        category: "gap",
        urgency: "anytime",
        formats: ["post", "thread", "reel"],
      },
    ],
  },
  {
    nicheKeywords: ["food", "cooking", "recipe", "chef", "baking"],
    opportunities: [
      {
        title: "Recette en une seule poêle",
        description: "Les recettes simples avec peu de vaisselle sont le contenu food le plus sauvegardé.",
        angle: "Filmez en plongée. Montrez tous les ingrédients d'abord. Restez sous 60 secondes.",
        score: 88,
        category: "evergreen",
        urgency: "anytime",
        formats: ["reel", "video"],
      },
      {
        title: "Test gustatif / avis",
        description: "Testez un produit ou une recette tendance. Des réactions authentiques = de l'engagement.",
        angle: "Soyez honnête dans votre réaction. Les gens voient quand c'est faux.",
        score: 80,
        category: "reactive",
        urgency: "now",
        formats: ["reel", "video"],
      },
    ],
  },
  {
    nicheKeywords: ["business", "entrepreneur", "startup", "marketing", "money"],
    opportunities: [
      {
        title: "Détail des revenus",
        description: "Partagez comment vous gagnez de l'argent. La transparence sur les revenus est rare et précieuse.",
        angle: "Utilisez un camembert ou un graphique à barres. Montrez les vrais chiffres si vous êtes à l'aise.",
        score: 91,
        category: "evergreen",
        urgency: "anytime",
        formats: ["carousel", "thread", "post"],
      },
      {
        title: "Ce que je ferais différemment",
        description: "Si vous recommenciez aujourd'hui, que changeriez-vous ? Le contenu rétrospectif résonne.",
        angle: "Soyez précis : '3 choses que je ferais différemment si je redémarrais mon business aujourd'hui.'",
        score: 84,
        category: "evergreen",
        urgency: "anytime",
        formats: ["carousel", "thread", "reel"],
      },
    ],
  },
  {
    nicheKeywords: ["fashion", "style", "outfit", "beauty", "makeup"],
    opportunities: [
      {
        title: "Préparez-vous avec moi",
        description: "Les vidéos GRWM sont constamment très performantes sur toutes les plateformes.",
        angle: "Commentez vos choix. Ajoutez un commentaire personnel ou une storytime.",
        score: 87,
        category: "trending",
        urgency: "anytime",
        formats: ["reel", "video"],
      },
      {
        title: "Alternative abordable vs luxe",
        description: "Comparez des alternatives budget à des articles chers. Énorme potentiel de sauvegarde.",
        angle: "Montrez-les côte à côte. Soyez honnête sur les différences de qualité.",
        score: 85,
        category: "evergreen",
        urgency: "anytime",
        formats: ["reel", "carousel"],
      },
    ],
  },
  {
    nicheKeywords: ["travel", "adventure", "explore", "nomad"],
    opportunities: [
      {
        title: "Lieu secret à découvrir",
        description: "Partagez un endroit peu connu. Les lieux uniques sont sauvegardés pour de futurs voyages.",
        angle: "Incluez des infos pratiques : comment y aller, coût, meilleure période pour visiter.",
        score: 86,
        category: "evergreen",
        urgency: "anytime",
        formats: ["reel", "carousel", "post"],
      },
      {
        title: "Astuce voyage petit budget",
        description: "Les astuces voyage pour économiser sont infiniment partageables.",
        angle: "Concentrez-vous sur une astuce précise avec les montants exacts économisés.",
        score: 82,
        category: "evergreen",
        urgency: "anytime",
        formats: ["carousel", "thread", "reel"],
      },
    ],
  },
];

// ---- Platform-specific boosters ----

const PLATFORM_BOOSTERS: Record<string, Omit<Opportunity, "id">[]> = {
  instagram: [
    {
      title: "Reel avec audio tendance",
      description: "Utilisez un son tendance pour booster la portée de vos Reels. L'algorithme favorise fortement les audios tendance.",
      angle: "Trouvez les sons tendance dans l'onglet Reels. Ajoutez votre touche niche à la tendance.",
      score: 89,
      category: "trending",
      urgency: "now",
      formats: ["reel"],
    },
    {
      title: "Carrousel éducatif",
      description: "Les carrousels obtiennent 3x plus d'engagement que les images simples sur Instagram.",
      angle: "Créez 7-10 diapos avec un point clé chacune. Texte en gras, couleurs de marque.",
      score: 84,
      category: "evergreen",
      urgency: "anytime",
      formats: ["carousel"],
    },
  ],
  tiktok: [
    {
      title: "Stitch d'une vidéo virale",
      description: "Faites un Stitch/Duet du contenu tendance avec votre avis d'expert. Profitez de la portée existante.",
      angle: "Trouvez une vidéo virale dans votre niche et ajoutez votre perspective unique.",
      score: 90,
      category: "reactive",
      urgency: "now",
      formats: ["reel"],
    },
    {
      title: "Format POV",
      description: "Les vidéos POV sont un classique TikTok. Des scénarios identifiables = des partages.",
      angle: "Restez court (15s). Rendez-le hyper-spécifique à votre audience de niche.",
      score: 82,
      category: "trending",
      urgency: "anytime",
      formats: ["reel"],
    },
  ],
  twitter: [
    {
      title: "Thread de décryptage",
      description: "Les threads longs sur X obtiennent une portée massive. Décryptez un sujet complexe.",
      angle: "10-15 tweets. Commencez par un hook percutant. Numérotez chaque point. Terminez par un CTA.",
      score: 87,
      category: "evergreen",
      urgency: "anytime",
      formats: ["thread"],
    },
    {
      title: "Citation tweet avec avis tranché",
      description: "Citez un tweet tendance avec votre avis de contre-courant ou d'expert.",
      angle: "Apportez une vraie valeur, pas juste 'Je suis d'accord.' Challengez ou enrichissez l'original.",
      score: 80,
      category: "reactive",
      urgency: "now",
      formats: ["post"],
    },
  ],
  linkedin: [
    {
      title: "Histoire de leçon de carrière",
      description: "Les histoires de carrière personnelles avec des leçons génèrent un énorme engagement LinkedIn.",
      angle: "Utilisez le format : situation → défi → ce que j'ai appris. Soyez vulnérable.",
      score: 88,
      category: "evergreen",
      urgency: "anytime",
      formats: ["post"],
    },
    {
      title: "Prédiction sectorielle",
      description: "Partagez votre prédiction pour votre secteur. Le thought leadership = des abonnés.",
      angle: "Appuyez-vous sur des données ou de l'expérience. Demandez aux autres de partager leur vision.",
      score: 83,
      category: "reactive",
      urgency: "this_week",
      formats: ["post", "carousel"],
    },
  ],
  youtube: [
    {
      title: "Shorts à partir de vidéos longues",
      description: "Extrayez les 30-60 meilleures secondes d'une vidéo plus longue. Doublez votre production de contenu.",
      angle: "Choisissez le moment le plus surprenant ou précieux. Ajoutez des sous-titres.",
      score: 85,
      category: "evergreen",
      urgency: "anytime",
      formats: ["reel"],
    },
    {
      title: "Tutoriel avec enregistrement d'écran",
      description: "Les tutoriels étape par étape se classent bien dans la recherche YouTube pour toujours.",
      angle: "Résolvez UN problème précis. Rendez le titre recherchable.",
      score: 86,
      category: "evergreen",
      urgency: "anytime",
      formats: ["video"],
    },
  ],
};

// ---- Goal-specific opportunities ----

const GOAL_OPPORTUNITIES: Record<string, Omit<Opportunity, "id">[]> = {
  grow_audience: [
    {
      title: "Collaborez avec un pair",
      description: "La promotion croisée avec quelqu'un de votre niveau double votre portée instantanément.",
      angle: "Envoyez un DM à 3 créateurs de votre niche cette semaine. Proposez une idée de collab précise.",
      score: 85,
      category: "gap",
      urgency: "this_week",
      formats: ["reel", "post", "video"],
    },
  ],
  monetize: [
    {
      title: "Valeur gratuite → teaser payant",
      description: "Offrez 80 % de la valeur gratuitement, teasez les 20 % restants comme offre payante.",
      angle: "Créez un post 'Partie 1' avec une valeur massive. La Partie 2 est derrière votre offre.",
      score: 83,
      category: "evergreen",
      urgency: "this_week",
      formats: ["carousel", "thread", "video"],
    },
  ],
  engagement: [
    {
      title: "Appât à sauvegarde",
      description: "Créez du contenu explicitement conçu pour être sauvegardé. Les sauvegardes = de l'or algorithmique.",
      angle: "Checklists, antisèches, guides de référence. Dites 'Sauvegardez pour plus tard.'",
      score: 86,
      category: "evergreen",
      urgency: "anytime",
      formats: ["carousel", "post"],
    },
  ],
  brand_awareness: [
    {
      title: "Post d'histoire d'origine de la marque",
      description: "Racontez votre histoire fondatrice ou pourquoi vous avez commencé. La connexion émotionnelle crée la fidélité.",
      angle: "Soyez honnête sur les difficultés. Les gens se connectent à la vulnérabilité, pas à la perfection.",
      score: 79,
      category: "evergreen",
      urgency: "anytime",
      formats: ["post", "carousel", "reel"],
    },
  ],
  consistency: [
    {
      title: "Série de contenu (Partie 1, 2, 3...)",
      description: "Une série numérotée crée de l'anticipation et vous donne un format de contenu récurrent.",
      angle: "Prenez votre sujet le plus performant et découpez-le en une série en 5 parties.",
      score: 81,
      category: "evergreen",
      urgency: "this_week",
      formats: ["carousel", "reel", "thread"],
    },
  ],
};

// ---- Main function ----

export function detectOpportunities(ctx: RadarContext): Opportunity[] {
  const all: Omit<Opportunity, "id">[] = [];
  const lowerNiche = ctx.niche.toLowerCase();

  // 1. Universal opportunities
  all.push(...UNIVERSAL_OPPORTUNITIES);

  // 2. Niche-specific
  for (const template of NICHE_TEMPLATES) {
    if (template.nicheKeywords.some((kw) => lowerNiche.includes(kw))) {
      all.push(...template.opportunities);
    }
  }

  // 3. Platform-specific
  const platformOpps = PLATFORM_BOOSTERS[ctx.platform];
  if (platformOpps) all.push(...platformOpps);

  // 4. Goal-specific
  for (const goal of ctx.goals) {
    const goalOpps = GOAL_OPPORTUNITIES[goal];
    if (goalOpps) all.push(...goalOpps);
  }

  // 5. Filter out ideas too similar to existing content
  const existingLower = ctx.existingTitles.map((t) => t.toLowerCase());
  const filtered = all.filter((opp) => {
    const oppLower = opp.title.toLowerCase();
    return !existingLower.some(
      (t) => t.includes(oppLower) || oppLower.includes(t)
    );
  });

  // 6. Boost scores for anonymous profiles on faceless-friendly formats
  const boosted = filtered.map((opp) => {
    let score = opp.score;
    if (ctx.profileType === "anonymous") {
      const facelessFormats = ["carousel", "thread", "post"];
      if (opp.formats.some((f) => facelessFormats.includes(f))) {
        score = Math.min(100, score + 5);
      }
    }
    return { ...opp, score };
  });

  // 7. Sort by score desc, assign IDs
  return boosted
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((opp, i) => ({
      ...opp,
      id: `opp_${i}`,
    }));
}

// ---- Category labels ----

export const CATEGORIES: Record<Opportunity["category"], { label: string; color: string }> = {
  trending: { label: "Tendance", color: "bg-red-100 text-red-700" },
  evergreen: { label: "Evergreen", color: "bg-green-100 text-green-700" },
  seasonal: { label: "Saisonnier", color: "bg-amber-100 text-amber-700" },
  reactive: { label: "Réactif", color: "bg-blue-100 text-blue-700" },
  gap: { label: "Lacune de contenu", color: "bg-purple-100 text-purple-700" },
};

export const URGENCY_LABELS: Record<Opportunity["urgency"], { label: string; color: string }> = {
  now: { label: "Agir maintenant", color: "text-red-600" },
  this_week: { label: "Cette semaine", color: "text-amber-600" },
  anytime: { label: "À tout moment", color: "text-gray-500" },
};
