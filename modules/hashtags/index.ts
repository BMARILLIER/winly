/**
 * Hashtag Generator Engine
 *
 * Generates optimized hashtag sets from a local database organized by niche,
 * platform, and size category. Returns both an optimal mix and extended results.
 *
 * Data is fully local — no external API calls.
 */

// --- Types ---

export interface HashtagResult {
  hashtag: string;
  category: "large" | "medium" | "niche";
  estimatedPosts: string;
  relevanceScore: number; // 0-100
}

export interface HashtagSuggestion {
  topic: string;
  platform: string;
  niche: string;
  hashtags: HashtagResult[];
  copyText: string;
}

export interface HashtagExtendedResult {
  topic: string;
  platform: string;
  niche: string;
  optimal: HashtagResult[];
  optimalCopyText: string;
  all: {
    large: HashtagResult[];
    medium: HashtagResult[];
    niche: HashtagResult[];
  };
  totalCount: number;
}

// --- Platform hashtag count targets ---

const PLATFORM_COUNTS: Record<string, { large: number; medium: number; niche: number }> = {
  instagram: { large: 2, medium: 4, niche: 3 },
  tiktok: { large: 1, medium: 2, niche: 2 },
  twitter: { large: 1, medium: 1, niche: 1 },
  linkedin: { large: 1, medium: 2, niche: 2 },
  youtube: { large: 2, medium: 3, niche: 3 },
};

// --- Hashtag database ---

interface HashtagEntry {
  tag: string;
  category: "large" | "medium" | "niche";
  posts: string;
  keywords: string[];
}

const NICHE_HASHTAGS: Record<string, HashtagEntry[]> = {
  fitness: [
    // Large (8)
    { tag: "#fitness", category: "large", posts: "500M", keywords: ["fitness", "sport", "entrainement"] },
    { tag: "#gym", category: "large", posts: "250M", keywords: ["gym", "musculation", "salle"] },
    { tag: "#workout", category: "large", posts: "200M", keywords: ["workout", "entrainement", "exercice"] },
    { tag: "#fitnessmotivation", category: "large", posts: "120M", keywords: ["motivation", "fitness"] },
    { tag: "#bodybuilding", category: "large", posts: "100M", keywords: ["bodybuilding", "musculation", "muscle"] },
    { tag: "#healthylifestyle", category: "large", posts: "90M", keywords: ["sante", "healthy", "lifestyle", "vie saine"] },
    { tag: "#personaltrainer", category: "large", posts: "40M", keywords: ["coach", "trainer", "entraineur"] },
    { tag: "#fitfam", category: "large", posts: "110M", keywords: ["fitness", "communaute", "famille"] },
    // Medium (10)
    { tag: "#homeworkout", category: "medium", posts: "800K", keywords: ["maison", "home", "appartement"] },
    { tag: "#mealprep", category: "medium", posts: "600K", keywords: ["meal", "prep", "repas", "preparation"] },
    { tag: "#progressiveoverload", category: "medium", posts: "350K", keywords: ["surcharge", "progressive", "progression"] },
    { tag: "#morningroutine", category: "medium", posts: "500K", keywords: ["matin", "routine", "matinale"] },
    { tag: "#legday", category: "medium", posts: "450K", keywords: ["jambes", "leg", "squat"] },
    { tag: "#strengthtraining", category: "medium", posts: "700K", keywords: ["force", "strength", "musculation"] },
    { tag: "#fitnessjourney", category: "medium", posts: "550K", keywords: ["parcours", "journey", "transformation"] },
    { tag: "#gymlife", category: "medium", posts: "400K", keywords: ["gym", "salle", "life"] },
    { tag: "#proteinrecipes", category: "medium", posts: "200K", keywords: ["proteine", "recette", "protein"] },
    { tag: "#calisthenics", category: "medium", posts: "300K", keywords: ["calisthenics", "poids du corps", "bodyweight"] },
    // Niche (8)
    { tag: "#5amclub", category: "niche", posts: "45K", keywords: ["matin", "5h", "reveil", "discipline"] },
    { tag: "#mobilityroutine", category: "niche", posts: "30K", keywords: ["mobilite", "etirement", "flexibility"] },
    { tag: "#macrotracking", category: "niche", posts: "25K", keywords: ["macro", "tracking", "calories"] },
    { tag: "#pullupchallenge", category: "niche", posts: "18K", keywords: ["traction", "pullup", "challenge"] },
    { tag: "#mindbodyconnection", category: "niche", posts: "22K", keywords: ["mental", "corps", "esprit"] },
    { tag: "#functionalfitness", category: "niche", posts: "35K", keywords: ["fonctionnel", "functional", "mouvement"] },
    { tag: "#fitover30", category: "niche", posts: "28K", keywords: ["30", "age", "adulte"] },
    { tag: "#trainsmarter", category: "niche", posts: "15K", keywords: ["intelligent", "smart", "optimisation"] },
  ],

  tech: [
    // Large (8)
    { tag: "#technology", category: "large", posts: "200M", keywords: ["technologie", "tech"] },
    { tag: "#programming", category: "large", posts: "80M", keywords: ["programmation", "code", "coder"] },
    { tag: "#coding", category: "large", posts: "70M", keywords: ["code", "coding", "developpement"] },
    { tag: "#developer", category: "large", posts: "50M", keywords: ["developpeur", "dev", "developer"] },
    { tag: "#ai", category: "large", posts: "150M", keywords: ["ia", "ai", "intelligence artificielle"] },
    { tag: "#startup", category: "large", posts: "60M", keywords: ["startup", "entreprise", "lancement"] },
    { tag: "#webdevelopment", category: "large", posts: "30M", keywords: ["web", "site", "frontend", "backend"] },
    { tag: "#datascience", category: "large", posts: "25M", keywords: ["data", "donnees", "science", "analyse"] },
    // Medium (10)
    { tag: "#aitools", category: "medium", posts: "800K", keywords: ["outil", "ia", "ai", "tool", "chatgpt"] },
    { tag: "#nocode", category: "medium", posts: "500K", keywords: ["nocode", "no-code", "sans code"] },
    { tag: "#buildinpublic", category: "medium", posts: "400K", keywords: ["build", "public", "transparent"] },
    { tag: "#devsetup", category: "medium", posts: "200K", keywords: ["setup", "bureau", "configuration"] },
    { tag: "#opensource", category: "medium", posts: "600K", keywords: ["open source", "github", "libre"] },
    { tag: "#learntocode", category: "medium", posts: "350K", keywords: ["apprendre", "learn", "debutant"] },
    { tag: "#saas", category: "medium", posts: "450K", keywords: ["saas", "logiciel", "service"] },
    { tag: "#productivity", category: "medium", posts: "700K", keywords: ["productivite", "efficacite", "workflow"] },
    { tag: "#chatgpt", category: "medium", posts: "900K", keywords: ["chatgpt", "openai", "gpt", "ia"] },
    { tag: "#systemdesign", category: "medium", posts: "150K", keywords: ["architecture", "systeme", "design", "scalabilite"] },
    // Niche (8)
    { tag: "#indiehacker", category: "niche", posts: "40K", keywords: ["indie", "solo", "bootstrap"] },
    { tag: "#rustlang", category: "niche", posts: "35K", keywords: ["rust", "langage", "performance"] },
    { tag: "#vscodeextensions", category: "niche", posts: "20K", keywords: ["vscode", "extension", "editeur"] },
    { tag: "#devops", category: "niche", posts: "45K", keywords: ["devops", "deploy", "ci", "cd"] },
    { tag: "#microsaas", category: "niche", posts: "15K", keywords: ["micro", "saas", "petit", "niche"] },
    { tag: "#cleancode", category: "niche", posts: "25K", keywords: ["clean", "propre", "qualite", "refactoring"] },
    { tag: "#techcareer", category: "niche", posts: "30K", keywords: ["carriere", "emploi", "entretien"] },
    { tag: "#automationtools", category: "niche", posts: "18K", keywords: ["automation", "automatisation", "zapier"] },
  ],

  food: [
    // Large (8)
    { tag: "#food", category: "large", posts: "500M", keywords: ["nourriture", "manger", "food"] },
    { tag: "#foodie", category: "large", posts: "250M", keywords: ["foodie", "gourmand", "gourmet"] },
    { tag: "#foodporn", category: "large", posts: "300M", keywords: ["food", "porn", "delicieux"] },
    { tag: "#instafood", category: "large", posts: "200M", keywords: ["instagram", "food", "photo"] },
    { tag: "#cooking", category: "large", posts: "120M", keywords: ["cuisine", "cooking", "cuisiner"] },
    { tag: "#homemade", category: "large", posts: "80M", keywords: ["maison", "fait maison", "homemade"] },
    { tag: "#healthyfood", category: "large", posts: "100M", keywords: ["sante", "healthy", "equilibre"] },
    { tag: "#recipe", category: "large", posts: "90M", keywords: ["recette", "recipe"] },
    // Medium (10)
    { tag: "#quickrecipe", category: "medium", posts: "400K", keywords: ["rapide", "quick", "express", "15min"] },
    { tag: "#mealprepsunday", category: "medium", posts: "350K", keywords: ["meal prep", "dimanche", "preparation"] },
    { tag: "#streetfood", category: "medium", posts: "800K", keywords: ["street", "rue", "stand"] },
    { tag: "#sourdough", category: "medium", posts: "500K", keywords: ["levain", "pain", "boulangerie"] },
    { tag: "#foodphotography", category: "medium", posts: "600K", keywords: ["photo", "photographie", "styling"] },
    { tag: "#veganrecipes", category: "medium", posts: "450K", keywords: ["vegan", "vegetalien", "plante"] },
    { tag: "#fermentation", category: "medium", posts: "200K", keywords: ["fermentation", "kimchi", "probiotique"] },
    { tag: "#bakingathome", category: "medium", posts: "300K", keywords: ["patisserie", "baking", "gateau"] },
    { tag: "#comfortfood", category: "medium", posts: "550K", keywords: ["comfort", "reconfortant", "cocooning"] },
    { tag: "#onepotmeal", category: "medium", posts: "250K", keywords: ["one pot", "facile", "simple"] },
    // Niche (8)
    { tag: "#foodflatlay", category: "niche", posts: "35K", keywords: ["flatlay", "stylisme", "photo"] },
    { tag: "#fermentedfoods", category: "niche", posts: "28K", keywords: ["fermente", "probiotique", "sante"] },
    { tag: "#sourdoughstarter", category: "niche", posts: "20K", keywords: ["levain", "starter", "debutant"] },
    { tag: "#budgetmeals", category: "niche", posts: "40K", keywords: ["budget", "economique", "pas cher"] },
    { tag: "#seasonalcooking", category: "niche", posts: "15K", keywords: ["saison", "saisonnier", "local"] },
    { tag: "#zerowastekitchen", category: "niche", posts: "18K", keywords: ["zero dechet", "anti-gaspi", "ecologie"] },
    { tag: "#3ingredients", category: "niche", posts: "22K", keywords: ["3 ingredients", "simple", "minimal"] },
    { tag: "#brunchideas", category: "niche", posts: "30K", keywords: ["brunch", "weekend", "idee"] },
  ],

  business: [
    // Large (8)
    { tag: "#business", category: "large", posts: "300M", keywords: ["business", "entreprise", "affaires"] },
    { tag: "#entrepreneur", category: "large", posts: "200M", keywords: ["entrepreneur", "entreprendre"] },
    { tag: "#marketing", category: "large", posts: "150M", keywords: ["marketing", "publicite", "strategie"] },
    { tag: "#success", category: "large", posts: "180M", keywords: ["succes", "reussite", "success"] },
    { tag: "#leadership", category: "large", posts: "60M", keywords: ["leadership", "management", "leader"] },
    { tag: "#digitalmarketing", category: "large", posts: "80M", keywords: ["digital", "marketing", "en ligne"] },
    { tag: "#branding", category: "large", posts: "50M", keywords: ["branding", "marque", "identite"] },
    { tag: "#smallbusiness", category: "large", posts: "100M", keywords: ["petit", "small", "independant"] },
    // Medium (10)
    { tag: "#personalbrand", category: "medium", posts: "600K", keywords: ["personal", "personnel", "brand", "marque"] },
    { tag: "#creatoreconomy", category: "medium", posts: "400K", keywords: ["createur", "creator", "economie"] },
    { tag: "#remotework", category: "medium", posts: "500K", keywords: ["remote", "teletravail", "distance"] },
    { tag: "#contentmarketing", category: "medium", posts: "700K", keywords: ["contenu", "content", "marketing"] },
    { tag: "#sidehustle", category: "medium", posts: "450K", keywords: ["side", "hustle", "complementaire", "revenu"] },
    { tag: "#growthmindset", category: "medium", posts: "550K", keywords: ["growth", "mindset", "etat d'esprit"] },
    { tag: "#emailmarketing", category: "medium", posts: "300K", keywords: ["email", "newsletter", "mailing"] },
    { tag: "#communitybuilding", category: "medium", posts: "200K", keywords: ["communaute", "community", "engagement"] },
    { tag: "#solopreneur", category: "medium", posts: "350K", keywords: ["solo", "independant", "freelance"] },
    { tag: "#monetize", category: "medium", posts: "250K", keywords: ["monetiser", "revenu", "argent", "gagner"] },
    // Niche (8)
    { tag: "#buildinpublic", category: "niche", posts: "40K", keywords: ["build", "public", "transparent"] },
    { tag: "#microinfluencer", category: "niche", posts: "30K", keywords: ["micro", "influencer", "nano"] },
    { tag: "#linkedintips", category: "niche", posts: "35K", keywords: ["linkedin", "tips", "conseils"] },
    { tag: "#contentrepurposing", category: "niche", posts: "15K", keywords: ["repurpose", "recycler", "reformater"] },
    { tag: "#creatortoolkit", category: "niche", posts: "12K", keywords: ["outil", "toolkit", "stack"] },
    { tag: "#nichebusiness", category: "niche", posts: "20K", keywords: ["niche", "specialise", "cible"] },
    { tag: "#passiveincome", category: "niche", posts: "45K", keywords: ["passif", "revenu", "automatique"] },
    { tag: "#personalbranding101", category: "niche", posts: "18K", keywords: ["personal", "branding", "debutant", "guide"] },
  ],

  lifestyle: [
    // Large (8)
    { tag: "#lifestyle", category: "large", posts: "400M", keywords: ["lifestyle", "vie", "quotidien"] },
    { tag: "#selfcare", category: "large", posts: "100M", keywords: ["selfcare", "bien-etre", "soin"] },
    { tag: "#motivation", category: "large", posts: "200M", keywords: ["motivation", "inspiration"] },
    { tag: "#mindfulness", category: "large", posts: "60M", keywords: ["pleine conscience", "meditation", "mindfulness"] },
    { tag: "#aesthetic", category: "large", posts: "150M", keywords: ["aesthetic", "esthetique", "visuel"] },
    { tag: "#dailylife", category: "large", posts: "80M", keywords: ["quotidien", "daily", "jour"] },
    { tag: "#wellness", category: "large", posts: "70M", keywords: ["wellness", "bien-etre", "sante"] },
    { tag: "#positivevibes", category: "large", posts: "90M", keywords: ["positif", "vibes", "energie"] },
    // Medium (10)
    { tag: "#morningroutine", category: "medium", posts: "500K", keywords: ["matin", "routine", "matinale"] },
    { tag: "#productivitytips", category: "medium", posts: "400K", keywords: ["productivite", "tips", "astuces"] },
    { tag: "#slowliving", category: "medium", posts: "350K", keywords: ["slow", "lent", "tranquille"] },
    { tag: "#journaling", category: "medium", posts: "300K", keywords: ["journal", "ecriture", "carnet"] },
    { tag: "#minimalism", category: "medium", posts: "600K", keywords: ["minimalisme", "simple", "essentiel"] },
    { tag: "#lifehacks", category: "medium", posts: "450K", keywords: ["hack", "astuce", "truc"] },
    { tag: "#homedecor", category: "medium", posts: "700K", keywords: ["deco", "maison", "interieur"] },
    { tag: "#selfdevelopment", category: "medium", posts: "250K", keywords: ["developpement", "personnel", "croissance"] },
    { tag: "#habitsbuilding", category: "medium", posts: "200K", keywords: ["habitude", "routine", "discipline"] },
    { tag: "#weekendvibes", category: "medium", posts: "500K", keywords: ["weekend", "detente", "repos"] },
    // Niche (8)
    { tag: "#5amroutine", category: "niche", posts: "25K", keywords: ["5h", "matin", "reveil"] },
    { tag: "#digitaldetox", category: "niche", posts: "30K", keywords: ["detox", "digital", "deconnexion"] },
    { tag: "#intentionalliving", category: "niche", posts: "20K", keywords: ["intentionnel", "conscient", "choix"] },
    { tag: "#cozyhome", category: "niche", posts: "35K", keywords: ["cozy", "cocooning", "confort"] },
    { tag: "#gratitudepractice", category: "niche", posts: "15K", keywords: ["gratitude", "reconnaissance", "positif"] },
    { tag: "#sundayreset", category: "niche", posts: "40K", keywords: ["dimanche", "reset", "preparation"] },
    { tag: "#eveningroutine", category: "niche", posts: "22K", keywords: ["soir", "routine", "coucher"] },
    { tag: "#capsulewardrobe", category: "niche", posts: "28K", keywords: ["capsule", "garde-robe", "vetement"] },
  ],

  travel: [
    // Large (8)
    { tag: "#travel", category: "large", posts: "600M", keywords: ["voyage", "travel", "voyager"] },
    { tag: "#wanderlust", category: "large", posts: "150M", keywords: ["wanderlust", "envie", "aventure"] },
    { tag: "#travelphotography", category: "large", posts: "200M", keywords: ["photo", "photographie", "voyage"] },
    { tag: "#adventure", category: "large", posts: "120M", keywords: ["aventure", "adventure", "exploration"] },
    { tag: "#travelgram", category: "large", posts: "180M", keywords: ["instagram", "travel", "gram"] },
    { tag: "#explore", category: "large", posts: "250M", keywords: ["explorer", "decouvrir", "explore"] },
    { tag: "#instatravel", category: "large", posts: "100M", keywords: ["instagram", "travel", "voyage"] },
    { tag: "#roadtrip", category: "large", posts: "80M", keywords: ["road trip", "route", "voiture"] },
    // Medium (10)
    { tag: "#budgettravel", category: "medium", posts: "500K", keywords: ["budget", "economique", "pas cher"] },
    { tag: "#solotravel", category: "medium", posts: "700K", keywords: ["solo", "seul", "independant"] },
    { tag: "#backpacking", category: "medium", posts: "400K", keywords: ["backpack", "sac a dos", "routard"] },
    { tag: "#digitalnomad", category: "medium", posts: "600K", keywords: ["digital nomad", "teletravail", "nomade"] },
    { tag: "#travelitinerary", category: "medium", posts: "200K", keywords: ["itineraire", "planning", "programme"] },
    { tag: "#hiddengems", category: "medium", posts: "350K", keywords: ["cache", "secret", "perle"] },
    { tag: "#traveltips", category: "medium", posts: "800K", keywords: ["tips", "conseils", "astuces"] },
    { tag: "#eurotrip", category: "medium", posts: "450K", keywords: ["europe", "euro", "trip"] },
    { tag: "#vanlife", category: "medium", posts: "550K", keywords: ["van", "fourgon", "camping"] },
    { tag: "#sustainabletravel", category: "medium", posts: "150K", keywords: ["durable", "ecologique", "responsable"] },
    // Niche (8)
    { tag: "#slowtravel", category: "niche", posts: "40K", keywords: ["slow", "lent", "immersion"] },
    { tag: "#travelhacking", category: "niche", posts: "25K", keywords: ["hack", "astuce", "miles", "points"] },
    { tag: "#offthebeatenpath", category: "niche", posts: "30K", keywords: ["hors sentiers", "insolite", "unique"] },
    { tag: "#workcation", category: "niche", posts: "15K", keywords: ["travail", "vacances", "remote"] },
    { tag: "#femalesolotravel", category: "niche", posts: "35K", keywords: ["femme", "solo", "securite"] },
    { tag: "#travelwithkids", category: "niche", posts: "20K", keywords: ["enfant", "famille", "kids"] },
    { tag: "#overland", category: "niche", posts: "18K", keywords: ["terrestre", "overland", "4x4"] },
    { tag: "#housesitting", category: "niche", posts: "12K", keywords: ["house sitting", "gardiennage", "gratuit"] },
  ],

  beauty: [
    // Large (8)
    { tag: "#beauty", category: "large", posts: "500M", keywords: ["beaute", "beauty", "soin"] },
    { tag: "#makeup", category: "large", posts: "350M", keywords: ["maquillage", "makeup", "make up"] },
    { tag: "#skincare", category: "large", posts: "200M", keywords: ["skincare", "peau", "soin"] },
    { tag: "#beautytips", category: "large", posts: "80M", keywords: ["tips", "conseils", "astuces"] },
    { tag: "#haircare", category: "large", posts: "60M", keywords: ["cheveux", "hair", "coiffure"] },
    { tag: "#glam", category: "large", posts: "100M", keywords: ["glam", "glamour", "chic"] },
    { tag: "#naturalbeauty", category: "large", posts: "50M", keywords: ["naturel", "natural", "bio"] },
    { tag: "#beautyblogger", category: "large", posts: "40M", keywords: ["blog", "blogger", "influencer"] },
    // Medium (10)
    { tag: "#skincareRoutine", category: "medium", posts: "700K", keywords: ["routine", "skincare", "soin"] },
    { tag: "#cleanbeauty", category: "medium", posts: "500K", keywords: ["clean", "propre", "naturel"] },
    { tag: "#makeuptutorial", category: "medium", posts: "600K", keywords: ["tutoriel", "tutorial", "tuto"] },
    { tag: "#glowup", category: "medium", posts: "800K", keywords: ["glow", "transformation", "avant apres"] },
    { tag: "#drugstorebeauty", category: "medium", posts: "300K", keywords: ["drugstore", "pas cher", "accessible"] },
    { tag: "#kbeauty", category: "medium", posts: "450K", keywords: ["coreen", "korean", "kbeauty"] },
    { tag: "#hairtutorial", category: "medium", posts: "350K", keywords: ["cheveux", "tutoriel", "coiffure"] },
    { tag: "#nailart", category: "medium", posts: "550K", keywords: ["ongles", "nail", "manucure"] },
    { tag: "#acnejourney", category: "medium", posts: "200K", keywords: ["acne", "peau", "parcours"] },
    { tag: "#sunscreendaily", category: "medium", posts: "150K", keywords: ["solaire", "spf", "protection"] },
    // Niche (8)
    { tag: "#texturedhair", category: "niche", posts: "35K", keywords: ["texture", "boucles", "frises"] },
    { tag: "#skinbarrier", category: "niche", posts: "25K", keywords: ["barriere", "cutanee", "reparation"] },
    { tag: "#minimalistmakeup", category: "niche", posts: "20K", keywords: ["minimaliste", "simple", "naturel"] },
    { tag: "#retinoljourney", category: "niche", posts: "15K", keywords: ["retinol", "anti-age", "serum"] },
    { tag: "#slugging", category: "niche", posts: "18K", keywords: ["slugging", "hydratation", "vaseline"] },
    { tag: "#skincareover40", category: "niche", posts: "22K", keywords: ["40", "mature", "age"] },
    { tag: "#glasskin", category: "niche", posts: "30K", keywords: ["glass", "eclat", "lumineux"] },
    { tag: "#beautyshelfie", category: "niche", posts: "12K", keywords: ["shelfie", "etagere", "collection"] },
  ],

  music: [
    // Large (8)
    { tag: "#music", category: "large", posts: "500M", keywords: ["musique", "music"] },
    { tag: "#musician", category: "large", posts: "100M", keywords: ["musicien", "artiste", "musician"] },
    { tag: "#singer", category: "large", posts: "80M", keywords: ["chanteur", "chanteuse", "voix"] },
    { tag: "#songwriter", category: "large", posts: "50M", keywords: ["auteur", "compositeur", "ecriture"] },
    { tag: "#newmusic", category: "large", posts: "60M", keywords: ["nouveau", "sortie", "release"] },
    { tag: "#producer", category: "large", posts: "40M", keywords: ["producteur", "beatmaker", "producer"] },
    { tag: "#livemusic", category: "large", posts: "70M", keywords: ["live", "concert", "scene"] },
    { tag: "#hiphop", category: "large", posts: "120M", keywords: ["hip hop", "rap", "urban"] },
    // Medium (10)
    { tag: "#indiemusic", category: "medium", posts: "500K", keywords: ["indie", "independant", "alternatif"] },
    { tag: "#beatmaking", category: "medium", posts: "300K", keywords: ["beat", "production", "mao"] },
    { tag: "#singersongwriter", category: "medium", posts: "400K", keywords: ["auteur", "compositeur", "interprete"] },
    { tag: "#musicproduction", category: "medium", posts: "600K", keywords: ["production", "studio", "mix"] },
    { tag: "#coversong", category: "medium", posts: "350K", keywords: ["cover", "reprise", "chanson"] },
    { tag: "#homestudio", category: "medium", posts: "250K", keywords: ["home studio", "maison", "enregistrement"] },
    { tag: "#guitartok", category: "medium", posts: "200K", keywords: ["guitare", "guitar", "tiktok"] },
    { tag: "#vocaltips", category: "medium", posts: "150K", keywords: ["voix", "vocal", "technique"] },
    { tag: "#songwritingtips", category: "medium", posts: "180K", keywords: ["ecriture", "composition", "tips"] },
    { tag: "#musicdistribution", category: "medium", posts: "100K", keywords: ["distribution", "spotify", "sortie"] },
    // Niche (8)
    { tag: "#lofi", category: "niche", posts: "45K", keywords: ["lofi", "chill", "ambiance"] },
    { tag: "#musicnft", category: "niche", posts: "15K", keywords: ["nft", "web3", "blockchain"] },
    { tag: "#ableton", category: "niche", posts: "35K", keywords: ["ableton", "daw", "logiciel"] },
    { tag: "#songstructure", category: "niche", posts: "10K", keywords: ["structure", "couplet", "refrain"] },
    { tag: "#mixingtips", category: "niche", posts: "25K", keywords: ["mix", "mixage", "audio"] },
    { tag: "#independentartist", category: "niche", posts: "30K", keywords: ["independant", "auto-produit", "diy"] },
    { tag: "#lyricswriting", category: "niche", posts: "20K", keywords: ["paroles", "lyrics", "ecriture"] },
    { tag: "#openmic", category: "niche", posts: "18K", keywords: ["open mic", "scene ouverte", "live"] },
  ],

  gaming: [
    // Large (8)
    { tag: "#gaming", category: "large", posts: "300M", keywords: ["gaming", "jeu", "jouer"] },
    { tag: "#gamer", category: "large", posts: "200M", keywords: ["gamer", "joueur"] },
    { tag: "#videogames", category: "large", posts: "150M", keywords: ["jeu video", "videogames"] },
    { tag: "#twitch", category: "large", posts: "80M", keywords: ["twitch", "stream", "live"] },
    { tag: "#esports", category: "large", posts: "60M", keywords: ["esport", "competition", "pro"] },
    { tag: "#playstation", category: "large", posts: "100M", keywords: ["playstation", "ps5", "sony"] },
    { tag: "#xbox", category: "large", posts: "70M", keywords: ["xbox", "microsoft", "gamepass"] },
    { tag: "#pcgaming", category: "large", posts: "50M", keywords: ["pc", "ordinateur", "master race"] },
    // Medium (10)
    { tag: "#gamingsetup", category: "medium", posts: "600K", keywords: ["setup", "bureau", "configuration"] },
    { tag: "#indiegames", category: "medium", posts: "400K", keywords: ["indie", "independant", "petit studio"] },
    { tag: "#retrogaming", category: "medium", posts: "500K", keywords: ["retro", "ancien", "nostalgie"] },
    { tag: "#gamedev", category: "medium", posts: "350K", keywords: ["developpement", "dev", "creation"] },
    { tag: "#streamer", category: "medium", posts: "700K", keywords: ["stream", "streamer", "live"] },
    { tag: "#gamingcommunity", category: "medium", posts: "300K", keywords: ["communaute", "community"] },
    { tag: "#cozyGaming", category: "medium", posts: "250K", keywords: ["cozy", "detente", "chill"] },
    { tag: "#gamereview", category: "medium", posts: "200K", keywords: ["review", "test", "avis"] },
    { tag: "#nintendoswitch", category: "medium", posts: "450K", keywords: ["nintendo", "switch", "zelda"] },
    { tag: "#mobilegaming", category: "medium", posts: "350K", keywords: ["mobile", "telephone", "casual"] },
    // Niche (8)
    { tag: "#speedrun", category: "niche", posts: "40K", keywords: ["speedrun", "record", "rapide"] },
    { tag: "#gamingaesthetic", category: "niche", posts: "25K", keywords: ["aesthetic", "decor", "ambiance"] },
    { tag: "#pixelart", category: "niche", posts: "35K", keywords: ["pixel", "art", "retro"] },
    { tag: "#roguelike", category: "niche", posts: "20K", keywords: ["roguelike", "procedural", "difficile"] },
    { tag: "#steamdeck", category: "niche", posts: "30K", keywords: ["steam deck", "portable", "valve"] },
    { tag: "#gamedesign", category: "niche", posts: "28K", keywords: ["design", "conception", "game"] },
    { tag: "#couchcoop", category: "niche", posts: "12K", keywords: ["coop", "canape", "local"] },
    { tag: "#gamingontiktok", category: "niche", posts: "45K", keywords: ["tiktok", "clip", "court"] },
  ],

  education: [
    // Large (8)
    { tag: "#education", category: "large", posts: "150M", keywords: ["education", "apprendre", "savoir"] },
    { tag: "#learning", category: "large", posts: "100M", keywords: ["apprentissage", "learning", "formation"] },
    { tag: "#studygram", category: "large", posts: "60M", keywords: ["etude", "study", "studygram"] },
    { tag: "#teacher", category: "large", posts: "50M", keywords: ["professeur", "enseignant", "teacher"] },
    { tag: "#onlinelearning", category: "large", posts: "40M", keywords: ["en ligne", "online", "e-learning"] },
    { tag: "#knowledge", category: "large", posts: "80M", keywords: ["connaissance", "savoir", "knowledge"] },
    { tag: "#studytips", category: "large", posts: "30M", keywords: ["tips", "astuces", "methode"] },
    { tag: "#elearning", category: "large", posts: "25M", keywords: ["elearning", "cours", "formation"] },
    // Medium (10)
    { tag: "#learnontiktok", category: "medium", posts: "800K", keywords: ["tiktok", "apprendre", "decouvrir"] },
    { tag: "#studywithme", category: "medium", posts: "600K", keywords: ["etude", "ensemble", "motivation"] },
    { tag: "#teachersoftiktok", category: "medium", posts: "400K", keywords: ["prof", "teacher", "tiktok"] },
    { tag: "#edutok", category: "medium", posts: "500K", keywords: ["education", "tiktok", "apprendre"] },
    { tag: "#studymotivation", category: "medium", posts: "350K", keywords: ["motivation", "etude", "objectif"] },
    { tag: "#onlinecourse", category: "medium", posts: "300K", keywords: ["cours", "en ligne", "formation"] },
    { tag: "#languagelearning", category: "medium", posts: "450K", keywords: ["langue", "language", "polyglotte"] },
    { tag: "#bookstagram", category: "medium", posts: "700K", keywords: ["livre", "lecture", "book"] },
    { tag: "#studyaesthetic", category: "medium", posts: "250K", keywords: ["aesthetic", "bureau", "organisation"] },
    { tag: "#notestaking", category: "medium", posts: "200K", keywords: ["notes", "prise de notes", "resume"] },
    // Niche (8)
    { tag: "#pomodoro", category: "niche", posts: "35K", keywords: ["pomodoro", "technique", "timer"] },
    { tag: "#activrecall", category: "niche", posts: "20K", keywords: ["active recall", "memoire", "revision"] },
    { tag: "#spacedrepetition", category: "niche", posts: "15K", keywords: ["repetition", "espacee", "anki"] },
    { tag: "#studyvlog", category: "niche", posts: "30K", keywords: ["vlog", "etude", "quotidien"] },
    { tag: "#notiontemplate", category: "niche", posts: "25K", keywords: ["notion", "template", "organisation"] },
    { tag: "#secondbrain", category: "niche", posts: "18K", keywords: ["second brain", "zettelkasten", "notes"] },
    { tag: "#microlearning", category: "niche", posts: "12K", keywords: ["micro", "court", "rapide"] },
    { tag: "#skillstacking", category: "niche", posts: "10K", keywords: ["competence", "polyvalent", "stack"] },
  ],

  fashion: [
    // Large (8)
    { tag: "#fashion", category: "large", posts: "1B", keywords: ["mode", "fashion", "style"] },
    { tag: "#style", category: "large", posts: "500M", keywords: ["style", "look", "tenue"] },
    { tag: "#ootd", category: "large", posts: "400M", keywords: ["outfit", "tenue du jour", "ootd"] },
    { tag: "#streetstyle", category: "large", posts: "100M", keywords: ["street", "rue", "urbain"] },
    { tag: "#fashionblogger", category: "large", posts: "80M", keywords: ["blog", "blogger", "influencer"] },
    { tag: "#outfitinspo", category: "large", posts: "60M", keywords: ["inspiration", "inspo", "idee"] },
    { tag: "#fashiontrends", category: "large", posts: "50M", keywords: ["tendance", "trend", "mode"] },
    { tag: "#mensfashion", category: "large", posts: "70M", keywords: ["homme", "mens", "masculin"] },
    // Medium (10)
    { tag: "#thrifting", category: "medium", posts: "600K", keywords: ["friperie", "thrift", "seconde main"] },
    { tag: "#sustainablefashion", category: "medium", posts: "500K", keywords: ["durable", "eco", "ethique"] },
    { tag: "#capsulewardrobe", category: "medium", posts: "400K", keywords: ["capsule", "garde-robe", "minimaliste"] },
    { tag: "#outfitideas", category: "medium", posts: "700K", keywords: ["idee", "outfit", "tenue"] },
    { tag: "#fashionhaul", category: "medium", posts: "350K", keywords: ["haul", "achats", "shopping"] },
    { tag: "#vintagestyle", category: "medium", posts: "450K", keywords: ["vintage", "retro", "ancien"] },
    { tag: "#fashiontiktok", category: "medium", posts: "800K", keywords: ["tiktok", "mode", "trend"] },
    { tag: "#layering", category: "medium", posts: "200K", keywords: ["superposition", "couches", "layering"] },
    { tag: "#workwear", category: "medium", posts: "300K", keywords: ["travail", "bureau", "professionnel"] },
    { tag: "#colorpalette", category: "medium", posts: "250K", keywords: ["couleur", "palette", "harmonie"] },
    // Niche (8)
    { tag: "#slowfashion", category: "niche", posts: "40K", keywords: ["slow", "lent", "conscient"] },
    { tag: "#outfit365", category: "niche", posts: "15K", keywords: ["365", "quotidien", "challenge"] },
    { tag: "#fashionflatlays", category: "niche", posts: "20K", keywords: ["flatlay", "photo", "stylisme"] },
    { tag: "#wardrobeedit", category: "niche", posts: "18K", keywords: ["tri", "edition", "garde-robe"] },
    { tag: "#secondhand", category: "niche", posts: "35K", keywords: ["seconde main", "occasion", "depot vente"] },
    { tag: "#monochromeoutfit", category: "niche", posts: "12K", keywords: ["monochrome", "unicolore", "total look"] },
    { tag: "#fashionover40", category: "niche", posts: "25K", keywords: ["40", "mature", "age"] },
    { tag: "#styleformula", category: "niche", posts: "10K", keywords: ["formule", "methode", "template"] },
  ],

  photography: [
    // Large (8)
    { tag: "#photography", category: "large", posts: "800M", keywords: ["photographie", "photo", "photography"] },
    { tag: "#photooftheday", category: "large", posts: "500M", keywords: ["photo", "jour", "daily"] },
    { tag: "#photographer", category: "large", posts: "200M", keywords: ["photographe", "photographer"] },
    { tag: "#naturephotography", category: "large", posts: "150M", keywords: ["nature", "paysage", "landscape"] },
    { tag: "#portrait", category: "large", posts: "100M", keywords: ["portrait", "visage", "personne"] },
    { tag: "#streetphotography", category: "large", posts: "80M", keywords: ["street", "rue", "urbain"] },
    { tag: "#landscapephotography", category: "large", posts: "60M", keywords: ["paysage", "landscape", "panorama"] },
    { tag: "#canonphotography", category: "large", posts: "40M", keywords: ["canon", "appareil", "reflex"] },
    // Medium (10)
    { tag: "#lightroom", category: "medium", posts: "600K", keywords: ["lightroom", "retouche", "edit"] },
    { tag: "#moodyphotography", category: "medium", posts: "400K", keywords: ["moody", "sombre", "atmospherique"] },
    { tag: "#goldenhour", category: "medium", posts: "500K", keywords: ["golden hour", "coucher", "lumiere"] },
    { tag: "#filmPhotography", category: "medium", posts: "350K", keywords: ["film", "argentique", "pellicule"] },
    { tag: "#compositiontips", category: "medium", posts: "200K", keywords: ["composition", "cadrage", "regle"] },
    { tag: "#dronePhotography", category: "medium", posts: "450K", keywords: ["drone", "aerien", "vue"] },
    { tag: "#editingtips", category: "medium", posts: "300K", keywords: ["retouche", "editing", "post-traitement"] },
    { tag: "#minimalphotography", category: "medium", posts: "250K", keywords: ["minimal", "simple", "epure"] },
    { tag: "#photowalk", category: "medium", posts: "180K", keywords: ["balade", "walk", "sortie"] },
    { tag: "#blackandwhite", category: "medium", posts: "700K", keywords: ["noir et blanc", "monochrome", "bnw"] },
    // Niche (8)
    { tag: "#35mmfilm", category: "niche", posts: "35K", keywords: ["35mm", "pellicule", "argentique"] },
    { tag: "#mobilephotography", category: "niche", posts: "40K", keywords: ["mobile", "telephone", "smartphone"] },
    { tag: "#longexposure", category: "niche", posts: "30K", keywords: ["longue exposition", "pose longue", "nuit"] },
    { tag: "#astrophotography", category: "niche", posts: "25K", keywords: ["astro", "etoiles", "nuit"] },
    { tag: "#prismeffect", category: "niche", posts: "10K", keywords: ["prisme", "effet", "creatif"] },
    { tag: "#photoessay", category: "niche", posts: "15K", keywords: ["essai", "serie", "histoire"] },
    { tag: "#tetheredshooting", category: "niche", posts: "8K", keywords: ["tethered", "studio", "connecte"] },
    { tag: "#photozine", category: "niche", posts: "12K", keywords: ["zine", "publication", "impression"] },
  ],
};

// --- Universal hashtags (work across all niches) ---

const UNIVERSAL_HASHTAGS: HashtagEntry[] = [
  // Large
  { tag: "#viral", category: "large", posts: "200M", keywords: ["viral", "buzz", "tendance"] },
  { tag: "#trending", category: "large", posts: "150M", keywords: ["tendance", "trending", "populaire"] },
  { tag: "#fyp", category: "large", posts: "500M", keywords: ["fyp", "foryou", "pour toi"] },
  { tag: "#reels", category: "large", posts: "300M", keywords: ["reels", "video", "court"] },
  // Medium
  { tag: "#contentcreator", category: "medium", posts: "800K", keywords: ["createur", "contenu", "creator"] },
  { tag: "#growthtips", category: "medium", posts: "300K", keywords: ["croissance", "growth", "audience"] },
  { tag: "#tipoftheday", category: "medium", posts: "400K", keywords: ["tip", "astuce", "conseil"] },
  { tag: "#valuecontent", category: "medium", posts: "150K", keywords: ["valeur", "educatif", "utile"] },
  // Niche
  { tag: "#microinfluencer", category: "niche", posts: "35K", keywords: ["micro", "petit", "authentique"] },
  { tag: "#authenticity", category: "niche", posts: "25K", keywords: ["authentique", "vrai", "transparent"] },
];

// --- Platform-specific hashtags ---

const PLATFORM_HASHTAGS: Record<string, HashtagEntry[]> = {
  instagram: [
    { tag: "#instadaily", category: "large", posts: "300M", keywords: ["instagram", "quotidien"] },
    { tag: "#reelsinstagram", category: "medium", posts: "500K", keywords: ["reels", "instagram", "video"] },
    { tag: "#igcreators", category: "niche", posts: "20K", keywords: ["instagram", "createur"] },
  ],
  tiktok: [
    { tag: "#tiktok", category: "large", posts: "500M", keywords: ["tiktok"] },
    { tag: "#tiktokviral", category: "medium", posts: "800K", keywords: ["viral", "tiktok", "buzz"] },
    { tag: "#fypage", category: "niche", posts: "45K", keywords: ["fyp", "page", "algorithme"] },
  ],
  twitter: [
    { tag: "#thread", category: "medium", posts: "200K", keywords: ["thread", "fil", "discussion"] },
    { tag: "#twittergrowth", category: "niche", posts: "15K", keywords: ["twitter", "croissance"] },
  ],
  linkedin: [
    { tag: "#linkedintips", category: "medium", posts: "300K", keywords: ["linkedin", "tips", "conseils"] },
    { tag: "#linkedincreator", category: "niche", posts: "20K", keywords: ["linkedin", "createur"] },
  ],
  youtube: [
    { tag: "#youtube", category: "large", posts: "400M", keywords: ["youtube", "video"] },
    { tag: "#youtubeshorts", category: "medium", posts: "600K", keywords: ["shorts", "court", "youtube"] },
    { tag: "#smallyoutuber", category: "niche", posts: "30K", keywords: ["petit", "debutant", "youtube"] },
  ],
};

// --- Scoring ---

// --- Synonyms for better French matching ---

const SYNONYM_MAP: Record<string, string[]> = {
  routine: ["habitude", "quotidien", "daily", "matin", "soir"],
  sport: ["fitness", "entrainement", "exercice", "workout", "gym", "musculation"],
  recette: ["cuisine", "recipe", "plat", "repas", "meal", "food", "manger"],
  healthy: ["sante", "sain", "bien-etre", "wellness", "healthy"],
  voyage: ["travel", "trip", "vacances", "destination", "aventure"],
  mode: ["fashion", "style", "vetement", "outfit", "look"],
  beaute: ["beauty", "skincare", "maquillage", "makeup", "soin"],
  business: ["entreprise", "entrepreneur", "startup", "commerce", "argent", "money"],
  tech: ["technologie", "code", "dev", "programmation", "ia", "ai", "app"],
  photo: ["photographie", "photography", "image", "visuel", "camera"],
  musique: ["music", "son", "beat", "chanson", "artiste"],
  gaming: ["jeu", "game", "gamer", "stream", "esport"],
  education: ["apprendre", "learn", "formation", "cours", "tutoriel", "tuto"],
  contenu: ["content", "post", "publication", "creation", "createur"],
  croissance: ["growth", "grandir", "audience", "followers", "abonnes"],
  engagement: ["like", "commentaire", "partage", "interaction", "communaute"],
  motivation: ["inspire", "inspiration", "mindset", "mental", "objectif"],
  productivite: ["productivity", "organisation", "efficacite", "temps", "planning"],
  lifestyle: ["vie", "quotidien", "life", "daily"],
};

function expandTopicWords(words: string[]): string[] {
  const expanded = new Set(words);
  for (const word of words) {
    // Direct synonym lookup
    for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
      if (key.includes(word) || word.includes(key) || synonyms.some((s) => s.includes(word) || word.includes(s))) {
        expanded.add(key);
        for (const s of synonyms) expanded.add(s);
      }
    }
  }
  return [...expanded];
}

// --- Dynamic hashtag generation from user topic ---

function generateDynamicHashtags(topic: string, topicWords: string[]): HashtagEntry[] {
  const results: HashtagEntry[] = [];
  const seen = new Set<string>();

  // 1. Full topic as a single hashtag (e.g. "routine matinale" → "#routinematinale")
  const fullTag = "#" + topic
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
  if (fullTag.length > 2 && !seen.has(fullTag)) {
    seen.add(fullTag);
    results.push({
      tag: fullTag,
      category: "niche",
      posts: "~",
      keywords: topicWords,
    });
  }

  // 2. Each individual word as a hashtag (if long enough)
  for (const word of topicWords) {
    const tag = "#" + word.replace(/[^a-z0-9]/g, "");
    if (tag.length >= 4 && !seen.has(tag)) {
      seen.add(tag);
      results.push({
        tag,
        category: "medium",
        posts: "~",
        keywords: [word],
      });
    }
  }

  // 3. Expanded synonyms as hashtags
  const expanded = expandTopicWords(topicWords);
  for (const word of expanded) {
    if (topicWords.includes(word)) continue; // already handled above
    const tag = "#" + word.replace(/[^a-z0-9]/g, "");
    if (tag.length >= 4 && !seen.has(tag)) {
      seen.add(tag);
      results.push({
        tag,
        category: "medium",
        posts: "~",
        keywords: [word, ...topicWords],
      });
    }
  }

  // 4. Common French hashtag patterns
  const patterns = [
    { prefix: "", suffix: "tips", category: "niche" as const },
    { prefix: "", suffix: "france", category: "niche" as const },
    { prefix: "", suffix: "community", category: "niche" as const },
    { prefix: "", suffix: "life", category: "medium" as const },
    { prefix: "", suffix: "daily", category: "niche" as const },
    { prefix: "", suffix: "motivation", category: "medium" as const },
  ];

  for (const word of topicWords) {
    const clean = word.replace(/[^a-z0-9]/g, "");
    if (clean.length < 3) continue;
    for (const p of patterns) {
      const tag = `#${p.prefix}${clean}${p.suffix}`;
      if (!seen.has(tag)) {
        seen.add(tag);
        results.push({
          tag,
          category: p.category,
          posts: "~",
          keywords: [word, p.suffix],
        });
      }
    }
  }

  return results;
}

function computeRelevanceScore(entry: HashtagEntry, topicWords: string[]): number {
  let score = 30; // base (lower so topic-matched ones stand out more)

  const expandedWords = expandTopicWords(topicWords);

  // Exact keyword match (strongest signal)
  const exactMatches = entry.keywords.filter((kw) =>
    expandedWords.some((tw) => kw === tw || tw === kw)
  ).length;
  score += exactMatches * 20;

  // Partial keyword match (substring)
  const partialMatches = entry.keywords.filter((kw) =>
    expandedWords.some((tw) => (tw.length >= 3 && kw.includes(tw)) || (kw.length >= 3 && tw.includes(kw)))
  ).length;
  score += partialMatches * 12;

  // Also check if topic words appear in the hashtag itself (e.g. "#morningroutine" contains "routine")
  const tagLower = entry.tag.toLowerCase().replace("#", "");
  const tagMatches = expandedWords.filter((tw) => tw.length >= 3 && tagLower.includes(tw)).length;
  score += tagMatches * 10;

  // Category bonus: medium gets a boost (sweet spot)
  if (entry.category === "medium") score += 8;
  if (entry.category === "niche") score += 5;

  return Math.min(100, Math.max(0, score));
}

function normalizeTopicWords(topic: string): string[] {
  return topic
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .split(/[\s,;.!?'+\-/]+/)
    .filter((w) => w.length > 2);
}

// --- Deduplication helper ---

function deduplicateHashtags(entries: HashtagEntry[]): HashtagEntry[] {
  const seen = new Set<string>();
  return entries.filter((e) => {
    const key = e.tag.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// --- Main: optimal set ---

export function generateHashtags(
  topic: string,
  platform: string,
  niche: string
): HashtagSuggestion {
  const topicWords = normalizeTopicWords(topic);
  const counts = PLATFORM_COUNTS[platform] ?? PLATFORM_COUNTS.instagram;

  // Gather all candidate hashtags
  const nicheEntries = NICHE_HASHTAGS[niche] ?? [];
  const platformEntries = PLATFORM_HASHTAGS[platform] ?? [];

  // Generate dynamic hashtags from the topic itself
  const dynamicEntries = generateDynamicHashtags(topic, topicWords);

  const allEntries = deduplicateHashtags([
    ...dynamicEntries,
    ...nicheEntries,
    ...platformEntries,
    ...UNIVERSAL_HASHTAGS,
  ]);

  // Score all
  const scored: (HashtagEntry & { relevanceScore: number })[] = allEntries.map((e) => ({
    ...e,
    relevanceScore: computeRelevanceScore(e, topicWords),
  }));

  // Sort by relevance within each category, then pick top N
  const large = scored
    .filter((e) => e.category === "large")
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, counts.large);

  const medium = scored
    .filter((e) => e.category === "medium")
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, counts.medium);

  const nicheResults = scored
    .filter((e) => e.category === "niche")
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, counts.niche);

  const selected = [...large, ...medium, ...nicheResults];
  selected.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const hashtags: HashtagResult[] = selected.map((e) => ({
    hashtag: e.tag,
    category: e.category,
    estimatedPosts: e.posts,
    relevanceScore: e.relevanceScore,
  }));

  return {
    topic,
    platform,
    niche,
    hashtags,
    copyText: hashtags.map((h) => h.hashtag).join(" "),
  };
}

// --- Extended: all matching hashtags grouped by category ---

export function generateHashtagsExtended(
  topic: string,
  platform: string,
  niche: string
): HashtagExtendedResult {
  const topicWords = normalizeTopicWords(topic);
  const counts = PLATFORM_COUNTS[platform] ?? PLATFORM_COUNTS.instagram;

  const nicheEntries = NICHE_HASHTAGS[niche] ?? [];
  const platformEntries = PLATFORM_HASHTAGS[platform] ?? [];
  const dynamicEntries = generateDynamicHashtags(topic, topicWords);

  const allEntries = deduplicateHashtags([
    ...dynamicEntries,
    ...nicheEntries,
    ...platformEntries,
    ...UNIVERSAL_HASHTAGS,
  ]);

  const scored = allEntries.map((e) => ({
    ...e,
    relevanceScore: computeRelevanceScore(e, topicWords),
  }));

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const toResult = (e: (typeof scored)[number]): HashtagResult => ({
    hashtag: e.tag,
    category: e.category,
    estimatedPosts: e.posts,
    relevanceScore: e.relevanceScore,
  });

  const allLarge = scored.filter((e) => e.category === "large").map(toResult);
  const allMedium = scored.filter((e) => e.category === "medium").map(toResult);
  const allNiche = scored.filter((e) => e.category === "niche").map(toResult);

  // Optimal set
  const optLarge = allLarge.slice(0, counts.large);
  const optMedium = allMedium.slice(0, counts.medium);
  const optNiche = allNiche.slice(0, counts.niche);
  const optimal = [...optLarge, ...optMedium, ...optNiche].sort(
    (a, b) => b.relevanceScore - a.relevanceScore
  );

  return {
    topic,
    platform,
    niche,
    optimal,
    optimalCopyText: optimal.map((h) => h.hashtag).join(" "),
    all: {
      large: allLarge,
      medium: allMedium,
      niche: allNiche,
    },
    totalCount: allLarge.length + allMedium.length + allNiche.length,
  };
}

// --- Category labels for UI ---

export const HASHTAG_CATEGORIES = {
  large: { label: "Large (forte portée)", color: "info" },
  medium: { label: "Medium (équilibre idéal)", color: "violet" },
  niche: { label: "Niche (ciblé)", color: "cyan" },
} as const;
