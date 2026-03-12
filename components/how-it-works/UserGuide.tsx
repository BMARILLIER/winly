"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  Star,
  Award,
  ListChecks,
  Target,
  BarChart3,
  Lightbulb,
  Sprout,
  FileBarChart,
  Radar,
  TrendingUp,
  Zap,
  TestTube,
  Gem,
  FlaskConical,
  Users,
  FileText,
  Anchor,
  UserCircle,
  Recycle,
  CalendarDays,
  MessageCircle,
  Share2,
  Settings,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface GuideSection {
  id: string;
  category: string;
  items: GuideItem[];
}

interface GuideItem {
  icon: LucideIcon;
  title: string;
  path: string;
  description: string;
  details: string[];
}

const guideSections: GuideSection[] = [
  {
    id: "principal",
    category: "Tableau de bord & Scoring",
    items: [
      {
        icon: LayoutDashboard,
        title: "Dashboard",
        path: "/dashboard",
        description: "Votre centre de commande. Visualisez en un coup d'œil la performance globale de votre compte social.",
        details: [
          "KPIs principaux : followers, engagement, portée",
          "Recommandations rapides basées sur vos données",
          "Accès direct à toutes les fonctionnalités",
        ],
      },
      {
        icon: ClipboardCheck,
        title: "Audit de profil",
        path: "/audit",
        description: "Analysez votre profil en répondant à un questionnaire en 6 catégories. Winly génère un rapport complet avec des conseils.",
        details: [
          "6 catégories d'analyse : bio, contenu, engagement, hashtags, visuels, stratégie",
          "Score détaillé par catégorie (0 à 100)",
          "Recommandations personnalisées pour chaque point faible",
        ],
      },
      {
        icon: Star,
        title: "Score Winly",
        path: "/score",
        description: "Obtenez un score unique qui résume la santé de votre compte social sur 5 piliers.",
        details: [
          "5 piliers : contenu, engagement, régularité, audience, stratégie",
          "Note globale de A+ à F",
          "Évolution dans le temps pour mesurer vos progrès",
        ],
      },
      {
        icon: Award,
        title: "Creator Score",
        path: "/creator-score",
        description: "Un score avancé multi-facteurs qui évalue votre potentiel en tant que créateur.",
        details: [
          "Facteurs : engagement, croissance, consistance, performance, profil",
          "Pondération intelligente selon votre niche",
          "Comparaison avec les benchmarks de votre secteur",
        ],
      },
    ],
  },
  {
    id: "progression",
    category: "Plan & Progression",
    items: [
      {
        icon: ListChecks,
        title: "Plan d'action",
        path: "/action-plan",
        description: "Winly génère un plan d'action concret basé sur vos scores et votre audit.",
        details: [
          "Actions prioritaires classées par impact",
          "Conseils adaptés à votre plateforme (Instagram, TikTok, etc.)",
          "Suivi de la mise en œuvre",
        ],
      },
      {
        icon: Target,
        title: "Missions quotidiennes",
        path: "/missions",
        description: "3 missions par jour pour améliorer progressivement votre compte. Gagnez des XP et montez de niveau.",
        details: [
          "3 missions fraîches chaque jour",
          "4 catégories : contenu, engagement, stratégie, apprentissage",
          "Système de streak : ne cassez pas votre série !",
        ],
      },
      {
        icon: BarChart3,
        title: "Progression",
        path: "/progress",
        description: "Suivez votre évolution avec un système de niveaux et d'achievements.",
        details: [
          "5 niveaux de progression (Débutant → Expert)",
          "XP cumulés par missions et actions",
          "Badges et achievements à débloquer",
        ],
      },
    ],
  },
  {
    id: "intelligence",
    category: "Intelligence & Analyse",
    items: [
      {
        icon: BarChart3,
        title: "Analytics",
        path: "/analytics",
        description: "Tableaux et graphiques détaillés de vos performances sur 30 jours.",
        details: [
          "Courbe d'engagement journalière",
          "Top posts par performance",
          "Sources de trafic et démographie",
        ],
      },
      {
        icon: Lightbulb,
        title: "AI Insights",
        path: "/ai-insights",
        description: "L'IA analyse vos données et vous livre des insights actionnables.",
        details: [
          "Détection automatique des tendances dans vos stats",
          "Recommandations basées sur les patterns identifiés",
          "Alertes sur les anomalies de performance",
        ],
      },
      {
        icon: Sprout,
        title: "Growth",
        path: "/growth",
        description: "Suivez la croissance de votre audience avec des métriques détaillées.",
        details: [
          "Courbe de croissance des followers",
          "Taux de croissance quotidien/hebdomadaire",
          "Heatmap des jours les plus performants",
        ],
      },
      {
        icon: FileBarChart,
        title: "Rapports",
        path: "/reports",
        description: "Rapports complets et exportables de vos performances.",
        details: [
          "Rapport hebdomadaire automatique",
          "Synthèse des KPIs clés",
          "Partage facile avec votre équipe ou vos clients",
        ],
      },
    ],
  },
  {
    id: "radar",
    category: "Radar & Tendances",
    items: [
      {
        icon: Radar,
        title: "Radar",
        path: "/radar",
        description: "Vue d'ensemble combinant tendances, marché et opportunités dans un seul écran.",
        details: [
          "Signaux de tendances détectés dans votre niche",
          "Score de momentum par sujet",
          "Actions recommandées pour chaque signal",
        ],
      },
      {
        icon: TrendingUp,
        title: "Trend Radar",
        path: "/trend-radar",
        description: "Détectez les tendances émergentes dans votre niche avant tout le monde.",
        details: [
          "Tendances classées par momentum",
          "Filtrage par plateforme et niche",
          "Fenêtre d'opportunité estimée",
        ],
      },
      {
        icon: TrendingUp,
        title: "Prédicteur",
        path: "/predict",
        description: "Prédisez la performance d'un contenu avant de le publier.",
        details: [
          "Score de prédiction basé sur votre historique",
          "Estimation de l'engagement attendu",
          "Suggestions d'optimisation pour améliorer le score",
        ],
      },
      {
        icon: Zap,
        title: "Viral Score",
        path: "/viral-score",
        description: "Évaluez le potentiel viral de vos idées de contenu.",
        details: [
          "Score de viralité sur 100",
          "Facteurs : hook, émotion, partageabilité, timing",
          "Conseils pour augmenter le potentiel viral",
        ],
      },
    ],
  },
  {
    id: "creation",
    category: "Création de contenu",
    items: [
      {
        icon: FileText,
        title: "Contenu",
        path: "/content",
        description: "Gérez votre pipeline d'idées de contenu. Créez, planifiez et suivez vos publications.",
        details: [
          "Formulaire rapide pour capturer vos idées",
          "Statuts : idée → en cours → planifié → publié",
          "Suggestions IA de contenu adaptées à votre niche",
        ],
      },
      {
        icon: TestTube,
        title: "Content Lab",
        path: "/content-lab",
        description: "Laboratoire d'expérimentation pour tester vos idées de contenu.",
        details: [
          "Testez différentes variantes de titres et hooks",
          "Comparaison de formats (Reel vs Carrousel vs Post)",
          "Score de performance estimé pour chaque variante",
        ],
      },
      {
        icon: Anchor,
        title: "Hooks",
        path: "/hooks",
        description: "Générateur de hooks percutants pour capter l'attention dès les premières secondes.",
        details: [
          "5 types : curiosité, storytelling, éducatif, controversé, statistique",
          "Bibliothèque de hooks sauvegardés",
          "Adaptés à votre plateforme et votre niche",
        ],
      },
      {
        icon: UserCircle,
        title: "Bio",
        path: "/bio",
        description: "Analysez et optimisez votre bio pour maximiser les conversions.",
        details: [
          "Analyse de la bio actuelle (clarté, CTA, mots-clés)",
          "Suggestions d'amélioration",
          "Templates par secteur d'activité",
        ],
      },
      {
        icon: Recycle,
        title: "Repurpose",
        path: "/repurpose",
        description: "Transformez un contenu en plusieurs formats pour multiplier votre portée.",
        details: [
          "Un post → Thread, Carrousel, Reel, Story, Newsletter",
          "Adaptation automatique au format cible",
          "Gain de temps : créez 5x plus de contenu",
        ],
      },
    ],
  },
  {
    id: "outils",
    category: "Outils & Stratégie",
    items: [
      {
        icon: CalendarDays,
        title: "Calendrier éditorial",
        path: "/calendar",
        description: "Planifiez vos publications sur la semaine avec une vue calendrier.",
        details: [
          "Vue semaine avec glisser-déposer",
          "Visualisez les créneaux optimaux de publication",
          "Synchronisation avec votre pipeline de contenu",
        ],
      },
      {
        icon: MessageCircle,
        title: "Coach IA",
        path: "/coach",
        description: "Posez vos questions stratégiques au coach Winly. Il vous guide pas à pas.",
        details: [
          "Réponses adaptées à votre niche et plateforme",
          "Conseils de croissance personnalisés",
          "FAQ intégrée sur les meilleures pratiques",
        ],
      },
      {
        icon: Users,
        title: "Concurrents",
        path: "/competitors",
        description: "Analysez vos concurrents pour identifier leurs forces et vos opportunités.",
        details: [
          "Comparaison de scores avec vos concurrents",
          "Identification des contenus qui marchent chez eux",
          "Opportunités de différenciation",
        ],
      },
      {
        icon: Gem,
        title: "Opportunity Finder",
        path: "/opportunity-finder",
        description: "Détectez les opportunités de croissance inexploitées dans votre niche.",
        details: [
          "7 catégories d'opportunités analysées",
          "Score de potentiel pour chaque opportunité",
          "Plan d'action pour saisir chaque opportunité",
        ],
      },
      {
        icon: FlaskConical,
        title: "Simulateur de croissance",
        path: "/growth-simulator",
        description: "Simulez différents scénarios pour estimer votre croissance future.",
        details: [
          "Modifiez fréquence, format, engagement",
          "Comparaison de scénarios côte à côte",
          "Projection de croissance sur 3-6 mois",
        ],
      },
      {
        icon: Share2,
        title: "Score Card",
        path: "/share",
        description: "Générez une carte visuelle de votre score à partager sur les réseaux.",
        details: [
          "Plusieurs thèmes visuels disponibles",
          "Partage direct ou téléchargement",
          "Montrez vos progrès à votre communauté",
        ],
      },
    ],
  },
];

function GuideItem({ item, isOpen, onToggle }: { item: GuideItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 transition-all duration-200 hover:border-border-hover">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-4 text-left cursor-pointer"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-muted">
          <item.icon className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
          <p className="text-xs text-text-muted truncate">{item.path}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-text-muted transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border px-5 py-4 space-y-3">
            <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
            <ul className="space-y-2">
              {item.details.map((detail) => (
                <li key={detail} className="flex items-start gap-2 text-sm text-text-secondary">
                  <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserGuide() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState(guideSections[0].id);

  function toggle(key: string) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function expandAll() {
    const all = new Set<string>();
    for (const section of guideSections) {
      for (const item of section.items) {
        all.add(`${section.id}-${item.path}`);
      }
    }
    setOpenItems(all);
  }

  function collapseAll() {
    setOpenItems(new Set());
  }

  const activeSection = guideSections.find((s) => s.id === activeCategory) ?? guideSections[0];

  return (
    <section className="border-y border-border bg-surface-1 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">
            Mode d&apos;emploi complet
          </h2>
          <p className="mt-3 text-text-secondary max-w-xl mx-auto">
            Cliquez sur chaque fonctionnalité pour découvrir ce qu&apos;elle fait et comment l&apos;utiliser.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {guideSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveCategory(section.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
                activeCategory === section.id
                  ? "bg-gradient-to-r from-primary to-violet text-white shadow-glow"
                  : "border border-border bg-surface-2 text-text-secondary hover:border-border-hover hover:text-foreground"
              )}
            >
              {section.category}
            </button>
          ))}
        </div>

        {/* Expand/Collapse controls */}
        <div className="flex justify-end gap-3 mb-4">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs text-text-muted hover:text-accent transition-colors cursor-pointer"
          >
            Tout ouvrir
          </button>
          <span className="text-text-muted">·</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs text-text-muted hover:text-accent transition-colors cursor-pointer"
          >
            Tout fermer
          </button>
        </div>

        {/* Items grid */}
        <div className="grid gap-3 md:grid-cols-2">
          {activeSection.items.map((item) => {
            const key = `${activeSection.id}-${item.path}`;
            return (
              <GuideItem
                key={key}
                item={item}
                isOpen={openItems.has(key)}
                onToggle={() => toggle(key)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
