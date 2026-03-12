export interface AuditCategory {
  id: string;
  label: string;
  description: string;
  questions: AuditQuestion[];
}

export interface AuditQuestion {
  id: string;
  text: string;
  type: "yes_no" | "scale";
}

export interface CategoryScore {
  categoryId: string;
  label: string;
  score: number; // 0-100
  maxScore: number;
  tips: string[];
}

export interface AuditReport {
  overallScore: number;
  categories: CategoryScore[];
  createdAt: string;
}

export const AUDIT_CATEGORIES: AuditCategory[] = [
  {
    id: "bio",
    label: "Bio",
    description: "Votre bio est-elle claire, percutante et optimisée ?",
    questions: [
      { id: "bio_clear", text: "Votre bio explique-t-elle clairement ce que vous faites ?", type: "yes_no" },
      { id: "bio_value", text: "Votre bio communique-t-elle la valeur que vous apportez à votre audience ?", type: "yes_no" },
      { id: "bio_keywords", text: "Votre bio inclut-elle des mots-clés pertinents pour votre niche ?", type: "yes_no" },
    ],
  },
  {
    id: "positioning",
    label: "Positionnement",
    description: "Votre niche et votre angle unique sont-ils bien définis ?",
    questions: [
      { id: "pos_niche", text: "Avez-vous une niche clairement définie ?", type: "yes_no" },
      { id: "pos_unique", text: "Peut-on comprendre ce qui vous différencie en 5 secondes ?", type: "yes_no" },
      { id: "pos_audience", text: "Savez-vous exactement qui est votre audience cible ?", type: "yes_no" },
    ],
  },
  {
    id: "branding",
    label: "Branding",
    description: "Votre identité visuelle est-elle cohérente et reconnaissable ?",
    questions: [
      { id: "brand_visual", text: "Utilisez-vous des couleurs, polices ou un style visuel cohérent ?", type: "yes_no" },
      { id: "brand_tone", text: "Maintenez-vous un ton de voix cohérent ?", type: "yes_no" },
      { id: "brand_recognizable", text: "Quelqu'un pourrait-il reconnaître votre contenu sans voir votre nom ?", type: "yes_no" },
    ],
  },
  {
    id: "frequency",
    label: "Fréquence de publication",
    description: "Publiez-vous régulièrement et de manière constante ?",
    questions: [
      { id: "freq_regular", text: "Publiez-vous au moins une fois par semaine ?", type: "yes_no" },
      { id: "freq_consistent", text: "Respectez-vous un calendrier de publication régulier ?", type: "yes_no" },
      { id: "freq_plan", text: "Planifiez-vous votre contenu à l'avance ?", type: "yes_no" },
    ],
  },
  {
    id: "engagement",
    label: "Engagement",
    description: "Comment interagissez-vous avec votre audience ?",
    questions: [
      { id: "eng_reply", text: "Répondez-vous aux commentaires et aux messages privés ?", type: "yes_no" },
      { id: "eng_questions", text: "Posez-vous des questions ou créez-vous des sondages dans votre contenu ?", type: "yes_no" },
      { id: "eng_community", text: "Interagissez-vous avec d'autres créateurs de votre niche ?", type: "yes_no" },
    ],
  },
  {
    id: "cta",
    label: "Call to Action",
    description: "Vos publications guident-elles votre audience vers une action ?",
    questions: [
      { id: "cta_posts", text: "La plupart de vos publications incluent-elles un call to action clair ?", type: "yes_no" },
      { id: "cta_bio", text: "Votre bio inclut-elle un lien ou un CTA ?", type: "yes_no" },
      { id: "cta_varied", text: "Variez-vous vos CTA (suivre, partager, commenter, cliquer sur le lien) ?", type: "yes_no" },
    ],
  },
];

const CATEGORY_TIPS: Record<string, { yes: string; no: string }[]> = {
  bio: [
    { yes: "Votre bio explique ce que vous faites — gardez-la à jour.", no: "Ajoutez une phrase claire décrivant ce que vous faites." },
    { yes: "Bonne proposition de valeur dans votre bio.", no: "Expliquez l'avantage que votre audience obtient en vous suivant." },
    { yes: "Les mots-clés aident à la découvrabilité.", no: "Ajoutez des mots-clés spécifiques à votre niche pour être trouvé plus facilement." },
  ],
  positioning: [
    { yes: "Niche claire — cela aide à attirer la bonne audience.", no: "Définissez une niche spécifique pour vous démarquer." },
    { yes: "Bonne différenciation.", no: "Trouvez votre angle unique — qu'est-ce que vous faites différemment ?" },
    { yes: "Connaître son audience est essentiel.", no: "Créez un persona simple de votre audience (âge, centres d'intérêt, problèmes)." },
  ],
  branding: [
    { yes: "La cohérence visuelle construit la reconnaissance.", no: "Choisissez 2-3 couleurs de marque et utilisez-les systématiquement." },
    { yes: "Un ton cohérent construit la confiance.", no: "Définissez votre voix : amicale, experte, décontractée, audacieuse ?" },
    { yes: "Forte reconnaissance de marque !", no: "Développez une signature visuelle (template, filtre, format)." },
  ],
  frequency: [
    { yes: "Bon rythme de publication.", no: "Visez au moins une publication par semaine." },
    { yes: "La régularité bat le volume.", no: "Choisissez des jours précis pour publier et tenez-vous-y." },
    { yes: "Planifier à l'avance, c'est malin.", no: "Préparez votre contenu par lots et programmez-le à l'avance." },
  ],
  engagement: [
    { yes: "Répondre construit la communauté.", no: "Réservez 15 min/jour pour répondre aux commentaires." },
    { yes: "Le contenu interactif booste la portée.", no: "Terminez vos publications par une question pour lancer la conversation." },
    { yes: "L'engagement croisé aide la croissance.", no: "Commentez chez 5 créateurs de votre niche chaque jour." },
  ],
  cta: [
    { yes: "Les CTA génèrent de l'action.", no: "Ajoutez un CTA clair à chaque publication (sauvegarder, partager, commenter)." },
    { yes: "Le lien en bio est essentiel.", no: "Ajoutez un lien dans votre bio (linktree, site web, dernière offre)." },
    { yes: "Des CTA variés gardent les choses fraîches.", no: "Alternez entre suivre, partager, sauvegarder, commenter et lien." },
  ],
};

export function computeAuditReport(
  answers: Record<string, string>
): AuditReport {
  const categories: CategoryScore[] = AUDIT_CATEGORIES.map((cat) => {
    let score = 0;
    const maxScore = cat.questions.length;
    const tips: string[] = [];

    cat.questions.forEach((q, i) => {
      const answer = answers[q.id];
      const isYes = answer === "yes";
      if (isYes) score++;

      const tipSet = CATEGORY_TIPS[cat.id]?.[i];
      if (tipSet) {
        tips.push(isYes ? tipSet.yes : tipSet.no);
      }
    });

    return {
      categoryId: cat.id,
      label: cat.label,
      score: Math.round((score / maxScore) * 100),
      maxScore,
      tips,
    };
  });

  const overallScore = Math.round(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length
  );

  return {
    overallScore,
    categories,
    createdAt: new Date().toISOString(),
  };
}
