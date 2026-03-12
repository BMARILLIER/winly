export const PROFILE_TYPES = [
  { id: "personal_brand", label: "Personal Brand", description: "Construisez votre image personnelle et votre audience" },
  { id: "business", label: "Business", description: "Promouvez une entreprise, un produit ou un service" },
  { id: "anonymous", label: "Créateur anonyme", description: "Créez du contenu sans révéler votre identité" },
] as const;

export const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "twitter", label: "Twitter / X" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "youtube", label: "YouTube" },
] as const;

export const GOALS = [
  { id: "grow_audience", label: "Développer mon audience" },
  { id: "monetize", label: "Monétiser mon contenu" },
  { id: "brand_awareness", label: "Développer la notoriété de ma marque" },
  { id: "engagement", label: "Améliorer l'engagement" },
  { id: "consistency", label: "Publier plus régulièrement" },
] as const;

export const POST_FREQUENCIES = [
  { id: "daily", label: "Tous les jours" },
  { id: "few_per_week", label: "Quelques fois par semaine" },
  { id: "weekly", label: "Une fois par semaine" },
  { id: "few_per_month", label: "Quelques fois par mois" },
  { id: "irregular", label: "Pas de calendrier fixe" },
] as const;
