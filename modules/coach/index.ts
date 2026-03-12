// ---------------------------------------------------------------------------
// Social Growth Coach Engine
// Strategy analysis, recommendations, and Q&A — fully local, no AI API
// ---------------------------------------------------------------------------

import type { PillarResult } from "@/modules/score";

// ---- Types ----

export interface StrategyInsight {
  title: string;
  description: string;
  status: "strong" | "warning" | "weak";
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
}

export interface CoachAnswer {
  question: string;
  answer: string;
  relatedTopics: string[];
}

// ---- Strategy Analysis ----

interface StrategyContext {
  profileType: string;
  platform: string;
  niche: string;
  goals: string[];
  postFrequency: string;
  contentCount: number;
  scheduledCount: number;
  hasAudit: boolean;
  hasScore: boolean;
  scorePillars: PillarResult[] | null;
}

export function analyzeStrategy(ctx: StrategyContext): StrategyInsight[] {
  const insights: StrategyInsight[] = [];

  // Complétude du profil
  if (!ctx.hasAudit && !ctx.hasScore) {
    insights.push({
      title: "Aucun diagnostic effectué",
      description: "Lancez un Audit ou une évaluation Score pour comprendre vos forces et faiblesses.",
      status: "weak",
    });
  } else if (ctx.hasScore && Array.isArray(ctx.scorePillars) && ctx.scorePillars.length > 0) {
    const weakest = [...ctx.scorePillars].sort((a: { score: number; label: string }, b: { score: number; label: string }) => a.score - b.score)[0];
    if (weakest && weakest.score < 40) {
      insights.push({
        title: `${weakest.label} nécessite votre attention`,
        description: `Votre score ${weakest.label.toLowerCase()} est de ${weakest.score}/100. C'est votre plus grand levier de Growth.`,
        status: "weak",
      });
    } else if (weakest && weakest.score < 70) {
      insights.push({
        title: `Améliorez ${weakest.label}`,
        description: `Votre score ${weakest.label.toLowerCase()} (${weakest.score}/100) a une marge de progression.`,
        status: "warning",
      });
    } else {
      insights.push({
        title: "Base solide",
        description: "Tous vos piliers de score sont au-dessus de 70. Concentrez-vous sur la régularité et le passage à l'échelle.",
        status: "strong",
      });
    }
  }

  // Pipeline de contenu
  if (ctx.contentCount === 0) {
    insights.push({
      title: "Pipeline de contenu vide",
      description: "Vous n'avez aucune idée de contenu sauvegardée. Commencez à brainstormer dans le module Contenu.",
      status: "weak",
    });
  } else if (ctx.contentCount < 5) {
    insights.push({
      title: "Construisez votre stock de contenu",
      description: `Vous avez ${ctx.contentCount} idées de contenu. Visez au moins 10 pour garder de l'avance.`,
      status: "warning",
    });
  } else {
    insights.push({
      title: "Pipeline de contenu sain",
      description: `${ctx.contentCount} idées dans votre pipeline. Continuez sur cette lancée.`,
      status: "strong",
    });
  }

  // Planification du calendrier
  if (ctx.scheduledCount === 0) {
    insights.push({
      title: "Rien de planifié",
      description: "Utilisez le Calendrier pour planifier votre semaine et attribuer du contenu à des jours précis.",
      status: "weak",
    });
  } else if (ctx.scheduledCount < 3) {
    insights.push({
      title: "Planifiez plus de contenu",
      description: `Seulement ${ctx.scheduledCount} post(s) planifié(s). Essayez de remplir vos jours de publication.`,
      status: "warning",
    });
  } else {
    insights.push({
      title: "Calendrier actif",
      description: `${ctx.scheduledCount} posts planifiés. Vous anticipez — excellent !`,
      status: "strong",
    });
  }

  // Alignement de fréquence
  const freqTargets: Record<string, number> = {
    daily: 7, few_per_week: 3, weekly: 1, few_per_month: 1, irregular: 0,
  };
  const target = freqTargets[ctx.postFrequency] ?? 1;
  if (target > 0 && ctx.scheduledCount < target) {
    insights.push({
      title: "En dessous de votre objectif de publication",
      description: `Votre fréquence cible implique ~${target} post(s)/semaine mais vous en avez ${ctx.scheduledCount} planifié(s).`,
      status: "warning",
    });
  }

  // Conseil spécifique à la plateforme
  const platformTips: Record<string, StrategyInsight> = {
    instagram: {
      title: "Stratégie Instagram",
      description: "Misez sur les Reels pour la portée, les Carrousels pour les sauvegardes et les Stories pour l'engagement. Utilisez 3-5 hashtags pertinents.",
      status: "strong",
    },
    tiktok: {
      title: "Stratégie TikTok",
      description: "Publiez 1 à 3 fois/jour si possible. Les 3 premières secondes sont cruciales. Utilisez les sons tendance et répondez aux commentaires en vidéo.",
      status: "strong",
    },
    twitter: {
      title: "Stratégie Twitter/X",
      description: "Les threads sont les plus performants pour la Growth. Engagez-vous dans les réponses avant de publier. Construisez en public et partagez votre parcours.",
      status: "strong",
    },
    linkedin: {
      title: "Stratégie LinkedIn",
      description: "Les histoires personnelles et les leçons apprises fonctionnent le mieux. Publiez le matin. Engagez-vous dans les commentaires dans la première heure.",
      status: "strong",
    },
    youtube: {
      title: "Stratégie YouTube",
      description: "La miniature et le titre représentent 80 % du clic. Optimisez les 30 premières secondes pour la rétention. Publiez des Shorts pour la croissance d'abonnés.",
      status: "strong",
    },
  };
  const platformInsight = platformTips[ctx.platform];
  if (platformInsight) insights.push(platformInsight);

  return insights;
}

// ---- Recommendations ----

export function getRecommendations(ctx: StrategyContext): Recommendation[] {
  const recs: Recommendation[] = [];

  // Recommandations basées sur les objectifs
  const goalRecs: Record<string, Recommendation> = {
    grow_audience: {
      id: "rec_audience",
      title: "Misez sur la découvrabilité",
      description: "Créez du contenu partageable (carrousels, threads) et utilisez les fonctionnalités natives de la plateforme (Reels, Shorts) que l'algorithme favorise pour les nouvelles audiences.",
      category: "Growth",
      priority: "high",
    },
    monetize: {
      id: "rec_monetize",
      title: "Construisez votre échelle d'offres",
      description: "Commencez par un lead magnet gratuit, puis un produit digital à petit prix, puis des services à prix plus élevé. Mentionnez votre offre chaque semaine.",
      category: "Revenus",
      priority: "high",
    },
    brand_awareness: {
      id: "rec_brand",
      title: "Renforcez la cohérence visuelle",
      description: "Utilisez la même palette de couleurs, police et ton sur tous vos posts. Créez un template reconnaissable pour votre contenu.",
      category: "Branding",
      priority: "medium",
    },
    engagement: {
      id: "rec_engage",
      title: "Créez des lanceurs de conversation",
      description: "Terminez chaque post par une question. Utilisez des sondages et le format \"ceci ou cela\". Répondez à chaque commentaire dans l'heure.",
      category: "Engagement",
      priority: "high",
    },
    consistency: {
      id: "rec_consistency",
      title: "Mettez en place un workflow par lots",
      description: "Consacrez un jour par semaine à créer tout votre contenu. Utilisez le Calendrier pour planifier vos posts à l'avance.",
      category: "Workflow",
      priority: "medium",
    },
  };

  for (const goal of ctx.goals) {
    const rec = goalRecs[goal];
    if (rec) recs.push(rec);
  }

  // Recommandations par type de profil
  if (ctx.profileType === "anonymous") {
    recs.push({
      id: "rec_anon",
      title: "Tirez parti de l'anonymat",
      description: "Concentrez-vous sur la valeur pure. Utilisez une mascotte de marque ou une identité visuelle cohérente. Laissez le contenu être la star, pas le visage.",
      category: "Stratégie",
      priority: "medium",
    });
  }

  // Score-based recommendations
  if (ctx.scorePillars) {
    const weak = ctx.scorePillars.filter((p) => p.score < 50);
    for (const pillar of weak.slice(0, 2)) {
      recs.push({
        id: `rec_pillar_${pillar.pillarId}`,
        title: `Improve your ${pillar.label.toLowerCase()}`,
        description: pillar.advice,
        category: pillar.label,
        priority: "high",
      });
    }
  }

  // Recommandations intemporelles
  recs.push({
    id: "rec_80_20",
    title: "Suivez la règle des 80/20",
    description: "80 % de contenu à valeur ajoutée (éduquer, inspirer, divertir), 20 % de contenu promotionnel (offres, CTAs, ventes). Cela construit la confiance avant de vendre.",
    category: "Stratégie",
    priority: "low",
  });

  return recs;
}

// ---- Q&A Knowledge Base ----

interface QAEntry {
  keywords: string[];
  question: string;
  answer: string;
  topics: string[];
}

const QA_DATABASE: QAEntry[] = [
  {
    keywords: ["grow", "followers", "audience", "growth"],
    question: "Comment développer mes abonnés ?",
    answer: "Concentrez-vous sur 3 choses : (1) Créez du contenu partageable et sauvegardable qui apporte une vraie valeur. (2) Interagissez avec les autres dans votre niche — commentez sincèrement 10 posts/jour. (3) Utilisez les fonctionnalités natives de la plateforme (Reels, Shorts, Threads) qui bénéficient d'un boost algorithmique. La régularité bat la viralité. Visez 3-5 posts/semaine minimum.",
    topics: ["content", "engagement", "consistency"],
  },
  {
    keywords: ["hashtag", "hashtags", "tags"],
    question: "Comment utiliser les hashtags ?",
    answer: "Utilisez 3-5 hashtags très pertinents plutôt que 30 génériques. Mixez les tailles : 1 large (1M+ posts), 2 intermédiaires (10K-500K) et 2 spécifiques à votre niche. Placez-les en fin de légende ou dans le premier commentaire. Recherchez quels hashtags vos abonnés idéaux consultent réellement.",
    topics: ["reach", "discoverability"],
  },
  {
    keywords: ["best time", "when to post", "posting time", "schedule"],
    question: "Quel est le meilleur moment pour publier ?",
    answer: "Consultez les analytics de votre plateforme pour savoir quand VOTRE audience est la plus active. Indications générales : Instagram (7-9h, 12h, 19-21h), TikTok (7-9h, 12-15h, 19-23h), LinkedIn (7-8h, 12h, 17-18h), Twitter (8-10h, 12-13h). Mais la régularité à la même heure compte plus que l'heure exacte.",
    topics: ["scheduling", "reach"],
  },
  {
    keywords: ["engagement", "comments", "likes", "interact"],
    question: "Comment améliorer mon taux d'engagement ?",
    answer: "4 tactiques éprouvées : (1) Commencez chaque post par un hook qui arrête le scroll. (2) Terminez par une question ou un CTA qui invite à répondre. (3) Répondez à chaque commentaire dans la première heure — cela envoie un signal à l'algorithme. (4) Utilisez des formats interactifs : sondages, FAQ, posts \"avis tranché\", carrousels avec un manque de connaissance à combler.",
    topics: ["content", "community"],
  },
  {
    keywords: ["monetize", "money", "income", "revenue", "earn"],
    question: "Comment monétiser mon contenu ?",
    answer: "Commencez par le chemin le plus simple : (1) Construisez une liste email avec un lead magnet gratuit. (2) Créez un petit produit digital (10-50 €) comme un template, guide ou mini-cours. (3) Proposez des services ou du coaching à un prix plus élevé. (4) À partir de 10K+ abonnés, explorez les partenariats de marque et sponsorings. N'attendez pas une énorme audience — 1 000 vrais fans peuvent faire vivre un business.",
    topics: ["revenue", "offer"],
  },
  {
    keywords: ["hook", "attention", "first line", "opening"],
    question: "Comment écrire de meilleurs hooks ?",
    answer: "5 formules de hook qui fonctionnent : (1) Curiosité : \"La plupart des gens se trompent sur X...\" (2) Chiffre précis : \"3 erreurs qui tuent votre croissance\" (3) Affirmation forte : \"Arrêtez de publier tous les jours. Voici pourquoi.\" (4) Histoire personnelle : \"Il y a 6 mois, j'ai failli abandonner...\" (5) Données : \"80 % des créateurs abandonnent en 90 jours.\" Testez différents styles et doublez la mise sur ce qui génère des sauvegardes.",
    topics: ["content", "hooks"],
  },
  {
    keywords: ["burnout", "tired", "motivation", "overwhelm", "quit"],
    question: "Comment éviter le burnout de contenu ?",
    answer: "Stratégies clés : (1) Créez par lots — une session par semaine pour tout le contenu. (2) Réutilisez — une idée devient un carrousel, un thread, un reel et un post. (3) Baissez la barre — chaque post n'a pas besoin d'être parfait. (4) Constituez une banque de 10+ posts prêts pour les jours de fatigue. (5) Faites des pauses — une semaine off ne tuera pas votre croissance, mais le burnout si.",
    topics: ["workflow", "mindset"],
  },
  {
    keywords: ["algorithm", "reach", "visibility", "impressions"],
    question: "Comment fonctionne l'algorithme ?",
    answer: "L'algorithme de chaque plateforme optimise une seule chose : garder les utilisateurs sur la plateforme. Pour travailler avec lui : (1) Obtenez de l'engagement dans les 30-60 premières minutes (répondez aux commentaires, partagez en stories). (2) Créez du contenu que les gens sauvegardent et partagent — ce sont les signaux les plus forts. (3) Utilisez les fonctionnalités natives (Reels > liens, Threads > tweets). (4) Soyez régulier — l'algorithme récompense la publication régulière plutôt que les hits viraux sporadiques.",
    topics: ["reach", "strategy"],
  },
  {
    keywords: ["niche", "topic", "focus", "positioning"],
    question: "Comment trouver ma niche ?",
    answer: "Votre niche se trouve à l'intersection de 3 choses : (1) Ce que vous savez et pouvez enseigner. (2) Ce sur quoi vous aimez créer. (3) Ce que les gens veulent vraiment apprendre. Commencez large, puis affinez en fonction de ce qui génère le plus d'engagement. Ne courez pas après les tendances — construisez votre expertise. Une niche spécifique (\"meal prep pour papas occupés\") croît plus vite qu'une large (\"cuisine\").",
    topics: ["positioning", "strategy"],
  },
  {
    keywords: ["anonymous", "faceless", "no face", "identity"],
    question: "Puis-je croître sans montrer mon visage ?",
    answer: "Absolument. De nombreux comptes à succès sont sans visage. Concentrez-vous sur : (1) Un branding visuel fort — couleurs, polices et templates cohérents. (2) Du contenu axé valeur — tutoriels, conseils, connaissances sélectionnées. (3) Une voix de marque unique qui remplace la connexion personnelle. (4) Des formats qui n'ont pas besoin de visage : carrousels, posts texte, enregistrements d'écran, vidéos voix off. La qualité du contenu compte plus que le visage derrière.",
    topics: ["anonymous", "branding"],
  },
  {
    keywords: ["content idea", "what to post", "ideas", "inspiration"],
    question: "Que devrais-je publier ?",
    answer: "Utilisez ces 5 piliers de contenu : (1) Éduquer — enseignez quelque chose d'utile dans votre niche. (2) Inspirer — partagez votre parcours, vos victoires et leçons. (3) Divertir — memes, avis tranchés, moments identifiables. (4) Engager — sondages, questions, \"ceci ou cela\". (5) Promouvoir — votre offre, produit ou CTA (max 20 % des posts). Alternez entre ces piliers chaque semaine.",
    topics: ["content", "planning"],
  },
  {
    keywords: ["bio", "profile", "about", "description"],
    question: "Comment écrire une bonne bio ?",
    answer: "Formule : (1) QUI vous êtes ou ce que vous faites (une ligne). (2) QUELLE valeur les gens obtiennent en vous suivant. (3) Un CTA (lien, invitation à s'abonner, invitation DM). Restez sous 150 caractères. Incluez vos mots-clés de niche. Ajoutez un lien. Utilisez l'Optimiseur de Bio dans Winly pour tester et améliorer la vôtre.",
    topics: ["profile", "bio"],
  },
  {
    keywords: ["carousel", "slides", "swipe"],
    question: "Comment créer des carrousels efficaces ?",
    answer: "Formule carrousel : (1) Diapo 1 = hook percutant qui promet de la valeur (\"5 choses que j'aurais aimé savoir\"). (2) Diapos 2-8 = un point clair par diapo avec un minimum de texte. (3) Dernière diapo = CTA (sauvegarder, partager, s'abonner). Conseils design : utilisez du texte large, des couleurs de marque cohérentes et numérotez chaque point. Les carrousels ont le meilleur taux de sauvegarde de tous les formats.",
    topics: ["content", "format"],
  },
  {
    keywords: ["video", "reel", "tiktok", "short"],
    question: "Comment faire de bonnes vidéos courtes ?",
    answer: "La règle des 3 secondes : si vous ne captez pas leur attention en 3 secondes, ils scrollent. (1) Commencez par du mouvement ou une affirmation forte — jamais \"Salut tout le monde !\" (2) Restez entre 15-30 secondes pour une rétention maximale. (3) Ajoutez des sous-titres — 80 % regardent sans le son. (4) Terminez par une boucle ou un CTA. (5) Utilisez les sons tendance mais ajoutez votre propre touche. Filmez en vertical, avec un bon éclairage, et allez droit au but.",
    topics: ["content", "video"],
  },
  {
    keywords: ["collab", "collaboration", "partnership", "network"],
    question: "Comment collaborer avec d'autres créateurs ?",
    answer: "Commencez par interagir sincèrement avec des créateurs de votre niveau (pas des méga-influenceurs). (1) Commentez leurs posts pendant 2-3 semaines. (2) Envoyez un DM avec une idée précise et mutuellement bénéfique — pas \"on collabore ?\". (3) Commencez petit : Lives Instagram, échanges de podcasts, carrousels co-créés. (4) Taguez-vous mutuellement et faites de la promotion croisée. Les meilleures collabs sont naturelles, pas transactionnelles.",
    topics: ["growth", "networking"],
  },
];

export function searchCoachAnswers(query: string): CoachAnswer[] {
  const lower = query.toLowerCase();
  const queryWords = lower.split(/\s+/).filter((w) => w.length > 2);

  const scored = QA_DATABASE.map((entry) => {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) score += 3;
    }
    for (const word of queryWords) {
      for (const kw of entry.keywords) {
        if (kw.includes(word) || word.includes(kw)) score += 1;
      }
    }
    return { entry, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => ({
      question: s.entry.question,
      answer: s.entry.answer,
      relatedTopics: s.entry.topics,
    }));
}
