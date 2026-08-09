"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";

// ============================================================================
// Démo interactive complète, aux couleurs FASUP', du site Attitude Alternance.
// Données 100% fictives (aucune connexion à Supabase, aucun appel IA réel) —
// objectif : que FASUP' puisse cliquer sur TOUTES les fonctionnalités
// (espace étudiant + espace école) pour se projeter dans l'outil réel.
//
// Deux jeux de données volontairement séparés :
// - MONA_APPS : les candidatures affichées côté "espace étudiant" (persona de
//   démo : Mona Bouzrara). L'utilisateur peut les modifier en live (Kanban,
//   ajout via Offres) sans que ça ne touche la vue école ci-dessous.
// - STUDENTS  : la photo figée que verrait FASUP' dans son espace école,
//   avec pour Mona exactement les 6 mêmes candidatures au départ — pour que
//   la démo reste cohérente entre les deux vues au moment de la présentation.
//
// Couleurs extraites du vrai logo FASUP' (public/partenaires/fasup-logo.png).
// ============================================================================

const FASUP_AMBER = "#F69E00";
const FASUP_DARK = "#2B2116";

type AppStatus = "a_candidater" | "envoyee" | "relance_a_faire" | "entretien_obtenu" | "refus" | "accepte";

const STATUS_LABELS: Record<AppStatus, string> = {
  a_candidater: "À candidater",
  envoyee: "Candidature envoyée",
  relance_a_faire: "Relance à faire",
  entretien_obtenu: "Entretien obtenu",
  refus: "Refus",
  accepte: "Accepté",
};

const STATUS_STYLES: Record<AppStatus, string> = {
  a_candidater: "bg-slate-100 text-slate-700 border-slate-200",
  envoyee: "bg-blue-50 text-blue-700 border-blue-200",
  relance_a_faire: "bg-amber-50 text-amber-700 border-amber-200",
  entretien_obtenu: "bg-orange-50 text-orange-700 border-orange-200",
  refus: "bg-red-50 text-red-600 border-red-200",
  accepte: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const KANBAN_COLUMNS: AppStatus[] = ["a_candidater", "envoyee", "relance_a_faire", "entretien_obtenu", "refus", "accepte"];

// Étape suivante logique quand on clique "Avancer" sur une carte du Kanban.
const NEXT_STATUS: Partial<Record<AppStatus, AppStatus>> = {
  a_candidater: "envoyee",
  envoyee: "relance_a_faire",
  relance_a_faire: "entretien_obtenu",
  entretien_obtenu: "accepte",
};

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------
interface DemoApplication {
  id: string;
  company: string;
  role: string;
  status: AppStatus;
  appliedDate: string;
  jobExcerpt?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  comment?: string;
}

interface DemoStudent {
  id: string;
  name: string;
  formation: string;
  promo: string;
  lastActive: string;
  cvUploaded: boolean;
  goal: number;
  shared: boolean;
  apps?: DemoApplication[];
  doneCount?: number;
}

function studentDone(s: DemoStudent): number {
  return s.shared && s.apps ? s.apps.length : (s.doneCount ?? 0);
}

function studentRelances(s: DemoStudent): number {
  return s.shared && s.apps ? s.apps.filter((a) => a.status === "relance_a_faire").length : 0;
}

// ----------------------------------------------------------------------------
// Données — espace étudiant (persona de démo : Mona Bouzrara)
// ----------------------------------------------------------------------------
const MONA_APPS: DemoApplication[] = [
  {
    id: "mona-1",
    company: "Decathlon",
    role: "Chargée de communication",
    status: "entretien_obtenu",
    appliedDate: "28/07/2026",
    jobExcerpt:
      "Vous accompagnerez le magasin dans l'animation de nos réseaux sociaux locaux et la mise en place d'actions de communication terrain en lien avec les rayons sport collectif et running.",
    recruiterName: "Julie Vasseur",
    recruiterEmail: "j.vasseur@decathlon.fr",
    comment: "Entretien prévu le 12/08, préparation déjà envoyée.",
  },
  {
    id: "mona-2",
    company: "Manutan",
    role: "Assistante marketing digital",
    status: "relance_a_faire",
    appliedDate: "22/07/2026",
    jobExcerpt: "Vous participerez au pilotage des campagnes e-mailing B2B et au reporting des performances auprès des chefs de marché.",
    comment: "Relance à envoyer avant le 15/08.",
  },
  { id: "mona-3", company: "BPCE", role: "Chargée de clientèle", status: "envoyee", appliedDate: "18/07/2026" },
  { id: "mona-4", company: "Groupe Fnac Darty", role: "Assistante e-commerce", status: "envoyee", appliedDate: "14/07/2026" },
  {
    id: "mona-5",
    company: "Bordeaux Métropole",
    role: "Chargée de projet communication",
    status: "refus",
    appliedDate: "08/07/2026",
    comment: "Poste finalement pourvu en interne.",
  },
  { id: "mona-6", company: "Cdiscount", role: "Assistante marketing", status: "a_candidater", appliedDate: "—", comment: "Candidature en préparation." },
];

const OFFERS: { company: string; role: string; city: string; sector: string; postedDaysAgo: number; jobExcerpt: string }[] = [
  {
    company: "Vignobles Ducourt",
    role: "Commercial export junior",
    city: "Ambès (33)",
    sector: "Commerce / Vente",
    postedDaysAgo: 2,
    jobExcerpt: "Vous accompagnerez l'équipe export dans le suivi des salons professionnels et la prospection de nouveaux distributeurs à l'étranger.",
  },
  {
    company: "Château Larrivet",
    role: "Chargé marketing digital",
    city: "Léognan (33)",
    sector: "Marketing / Communication",
    postedDaysAgo: 4,
    jobExcerpt: "Vous gérerez le calendrier éditorial des réseaux sociaux et participerez à la préparation de l'oenotourisme estival du domaine.",
  },
  {
    company: "Groupe La Poste",
    role: "Chargé de projet commercial",
    city: "Bordeaux (33)",
    sector: "Commerce / Vente",
    postedDaysAgo: 1,
    jobExcerpt: "Vous appuierez les conseillers commerciaux sur le suivi des rendez-vous professionnels et la relance des devis en attente.",
  },
  {
    company: "Auchan Retail",
    role: "Commercial junior",
    city: "Bordeaux-Lac (33)",
    sector: "Commerce / Vente",
    postedDaysAgo: 6,
    jobExcerpt: "Vous serez formé(e) à la négociation avec les fournisseurs locaux et au pilotage d'un rayon en autonomie progressive.",
  },
  {
    company: "Orange",
    role: "Alternant relation client",
    city: "Mérignac (33)",
    sector: "Télécoms",
    postedDaysAgo: 3,
    jobExcerpt: "Vous traiterez les demandes clients en boutique et participerez aux challenges de vente additionnelle de l'équipe.",
  },
  {
    company: "Cdiscount",
    role: "Assistant e-commerce",
    city: "Bordeaux (33)",
    sector: "E-commerce",
    postedDaysAgo: 5,
    jobExcerpt: "Vous mettrez à jour les fiches produits et suivrez les indicateurs de performance des campagnes promotionnelles du site.",
  },
];

// ----------------------------------------------------------------------------
// Données — espace école (vue FASUP' Bordeaux)
// ----------------------------------------------------------------------------
const STUDENTS: DemoStudent[] = [
  {
    id: "mona",
    name: "Mona Bouzrara",
    formation: "BTS NDRC — 2ᵉ année",
    promo: "2025-2027",
    lastActive: "Aujourd'hui",
    cvUploaded: true,
    goal: 5,
    shared: true,
    apps: MONA_APPS,
  },
  {
    id: "florent",
    name: "Florent Crouzet",
    formation: "BTS NDRC — 2ᵉ année",
    promo: "2025-2027",
    lastActive: "Hier",
    cvUploaded: true,
    goal: 5,
    shared: true,
    apps: [
      {
        id: "florent-1",
        company: "Cdiscount",
        role: "Assistant e-commerce",
        status: "accepte",
        appliedDate: "10/07/2026",
        recruiterName: "Karim Belaïd",
        recruiterEmail: "k.belaid@cdiscount.com",
      },
      { id: "florent-2", company: "Auchan Retail", role: "Commercial junior", status: "refus", appliedDate: "05/07/2026" },
      { id: "florent-3", company: "Groupe La Poste", role: "Chargé de projet commercial", status: "envoyee", appliedDate: "30/06/2026" },
      { id: "florent-4", company: "Decathlon", role: "Vendeur polyvalent alternant", status: "envoyee", appliedDate: "26/06/2026" },
      {
        id: "florent-5",
        company: "Manutan",
        role: "Assistant achats",
        status: "relance_a_faire",
        appliedDate: "20/06/2026",
        comment: "Relance en retard de 5 jours.",
      },
      { id: "florent-6", company: "Vignobles Ducourt", role: "Commercial export junior", status: "entretien_obtenu", appliedDate: "15/06/2026" },
      { id: "florent-7", company: "Château Larrivet", role: "Chargé marketing digital", status: "envoyee", appliedDate: "10/06/2026" },
    ],
  },
  {
    id: "clara",
    name: "Clara Hermabessière",
    formation: "BTS Commerce International — 1ère année",
    promo: "2025-2027",
    lastActive: "Il y a 6 jours",
    cvUploaded: false,
    goal: 3,
    shared: false,
    doneCount: 0,
  },
  {
    id: "martin",
    name: "Martin Philipot Chevret",
    formation: "BTS NDRC — 1ère année",
    promo: "2025-2027",
    lastActive: "Il y a 3 jours",
    cvUploaded: true,
    goal: 4,
    shared: false,
    doneCount: 1,
  },
  {
    id: "arthur",
    name: "Arthur Pitrau",
    formation: "BTS Commerce International — 2ᵉ année",
    promo: "2024-2026",
    lastActive: "Aujourd'hui",
    cvUploaded: true,
    goal: 5,
    shared: true,
    apps: [
      {
        id: "arthur-1",
        company: "Bordeaux Métropole",
        role: "Assistant communication",
        status: "relance_a_faire",
        appliedDate: "26/07/2026",
        comment: "Relance à faire.",
      },
      { id: "arthur-2", company: "Château Larrivet", role: "Chargé marketing digital", status: "relance_a_faire", appliedDate: "20/07/2026" },
      { id: "arthur-3", company: "Vignobles Ducourt", role: "Commercial export junior", status: "a_candidater", appliedDate: "—" },
    ],
  },
  {
    id: "raphael",
    name: "Raphael Fredou",
    formation: "BTS NDRC — 2ᵉ année",
    promo: "2024-2026",
    lastActive: "Aujourd'hui",
    cvUploaded: true,
    goal: 6,
    shared: true,
    apps: [
      {
        id: "raphael-1",
        company: "Orange",
        role: "Alternant relation client",
        status: "accepte",
        appliedDate: "02/06/2026",
        recruiterName: "Sophie Angel",
        recruiterEmail: "s.angel@orange.fr",
      },
      { id: "raphael-2", company: "Bordeaux Métropole", role: "Chargé de projet", status: "refus", appliedDate: "28/05/2026" },
      { id: "raphael-3", company: "Cdiscount", role: "Assistant marketing", status: "envoyee", appliedDate: "25/05/2026" },
      { id: "raphael-4", company: "Decathlon", role: "Vendeur conseil", status: "envoyee", appliedDate: "20/05/2026" },
      { id: "raphael-5", company: "Manutan", role: "Assistant commercial", status: "envoyee", appliedDate: "15/05/2026" },
      { id: "raphael-6", company: "BPCE", role: "Conseiller clientèle", status: "refus", appliedDate: "10/05/2026" },
      { id: "raphael-7", company: "Groupe La Poste", role: "Assistant logistique", status: "envoyee", appliedDate: "05/05/2026" },
      { id: "raphael-8", company: "Auchan Retail", role: "Commercial junior", status: "envoyee", appliedDate: "28/04/2026" },
    ],
  },
];

const TEMPLATES = [
  {
    label: "🎯 Rappel objectif de la semaine",
    subject: "Où en êtes-vous cette semaine ?",
    message:
      "Bonjour {prenom},\n\nOn a remarqué que vous n'avez pas encore atteint votre objectif de candidatures cette semaine. Besoin d'un coup de main pour trouver des offres ou relancer une candidature ?\n\nBon courage,\nL'équipe FASUP'",
  },
  {
    label: "📅 Point d'étape mi-parcours",
    subject: "Point d'étape sur votre recherche d'alternance",
    message:
      "Bonjour {prenom},\n\nOn fait un point à mi-parcours : où en êtes-vous ? Des entretiens en cours, des difficultés à trouver des offres ?\n\nRépondez-nous directement si besoin d'accompagnement.\n\nL'équipe FASUP'",
  },
  {
    label: "💬 Proposer un rendez-vous",
    subject: "Un rendez-vous conseil carrière ?",
    message:
      "Bonjour {prenom},\n\nNous proposons des rendez-vous individuels de 20 minutes pour faire le point sur votre recherche d'alternance.\n\nRépondez avec vos disponibilités si ça vous intéresse.\n\nL'équipe FASUP'",
  },
];

// ----------------------------------------------------------------------------
// Préparation d'entretien IA — contenu détaillé et non-générique (démo)
// ----------------------------------------------------------------------------
interface DemoPrep {
  besoinsImplicites: { extrait: string; interpretation: string }[];
  axeDifferenciant: string;
  syntheseAnnonce: string;
  pointsDeVigilance: { ecart: string; conseil: string }[];
  pitch: string;
  pointsForts: string[];
  astuces: string[];
  questionsProbables: string[];
  questionsARecruteur: string[];
}

const DECATHLON_PREP: DemoPrep = {
  besoinsImplicites: [
    {
      extrait: "animation de nos réseaux sociaux locaux et la mise en place d'actions de communication terrain",
      interpretation:
        "Ce n'est pas un poste de community manager assis derrière un écran : Decathlon veut quelqu'un capable d'aller sur le terrain, en magasin, au contact des rayons. Une expérience de vente, d'animation d'événement ou de tenue de stand compte davantage ici qu'un simple projet Instagram fait en cours.",
    },
    {
      extrait: "en lien avec les rayons sport collectif et running",
      interpretation:
        "L'annonce cite deux univers sportifs précis plutôt que « le sport » en général — signe que le magasin veut quelqu'un qui connaît ou pratique ces sports, pas juste « aimer le sport » de façon vague. Si vous jouez au foot, faites du running ou du basket, dites-le concrètement, avec des exemples.",
    },
  ],
  axeDifferenciant:
    "Ne vous présentez pas comme « quelqu'un qui aime le sport » : appuyez-vous sur une pratique précise (à adapter selon le profil réel de l'étudiant) et sur une expérience où vous avez dû communiquer ou vendre en face à face — pas seulement en ligne.",
  syntheseAnnonce:
    "Un poste hybride entre communication digitale et animation terrain, rattaché à un magasin physique plutôt qu'au siège — Decathlon cherche un relais local, pas un·e stratège marketing national.",
  pointsDeVigilance: [
    {
      ecart: "Le poste demande une culture sport précise (collectif + running) que le CV ne mentionne peut-être pas explicitement.",
      conseil:
        "Avant l'entretien, préparez 2-3 phrases sur votre pratique sportive personnelle, même amateur — c'est un sujet quasiment toujours abordé en entretien chez Decathlon.",
    },
    {
      ecart: "L'aspect « terrain » (animations en magasin) peut surprendre si la préparation s'était concentrée uniquement sur l'angle réseaux sociaux.",
      conseil: "Ayez un exemple concret de stand, d'événement ou de vente directe tenu — même en dehors du sport.",
    },
  ],
  pitch:
    "Passionnée de sport et actuellement en BTS NDRC, je recherche une alternance où je peux allier communication digitale et contact terrain. Ce qui m'attire chez ce magasin Decathlon, c'est justement ce mélange entre animation locale et réseaux sociaux — un poste qui bouge, pas un poste de bureau.",
  pointsForts: [
    "Formation BTS NDRC directement centrée sur la relation client et la négociation, utile pour l'animation terrain",
    "Aisance avec les outils de création de contenu (Canva, Reels) déjà mise en pratique sur un projet d'école",
    "Sens du contact déjà éprouvé via un job étudiant ou une expérience associative",
  ],
  astuces: [
    "Renseignez-vous sur les 2-3 dernières opérations locales du magasin visé (Facebook/Instagram) pour pouvoir en citer une en entretien.",
    "Préparez un exemple chiffré si possible (« j'ai généré X vues/inscriptions sur telle action ») — même à petite échelle, ça rassure sur votre capacité à mesurer l'impact.",
  ],
  questionsProbables: [
    "Quels sports pratiquez-vous et depuis combien de temps ?",
    "Racontez-nous une action de communication ou un événement que vous avez organisé.",
    "Comment réagiriez-vous si un client se plaint pendant une animation en magasin ?",
    "Êtes-vous à l'aise pour parler devant un groupe de clients ?",
  ],
  questionsARecruteur: [
    "Sur quels rayons ou univers sportifs se concentreront mes premières missions ?",
    "Comment s'articule le lien entre l'équipe communication du magasin et le siège Decathlon ?",
    "Quel est le rythme d'alternance envisagé (2j/3j, 1 semaine/1 semaine) ?",
  ],
};

const MANUTAN_PREP: DemoPrep = {
  besoinsImplicites: [
    {
      extrait: "pilotage des campagnes e-mailing B2B et au reporting des performances",
      interpretation:
        "Manutan vend à des professionnels (B2B), pas à des particuliers : la communication attendue est plus factuelle et orientée résultats que sur du BtoC. Le mot « reporting » indique aussi qu'ils veulent quelqu'un à l'aise avec des chiffres (taux d'ouverture, taux de clic), pas seulement créatif.",
    },
  ],
  axeDifferenciant:
    "Montrez que vous savez lire et interpréter des indicateurs simples (taux d'ouverture, taux de clic), même appris en cours — Manutan valorise la rigueur analytique autant que la créativité.",
  syntheseAnnonce: "Un poste orienté marketing opérationnel B2B, avec une vraie dimension reporting/chiffres plutôt que pure création de contenu.",
  pointsDeVigilance: [
    {
      ecart: "Le monde du B2B (vente à des professionnels) est différent du BtoC que la plupart des étudiants connaissent mieux.",
      conseil: "Expliquez en une phrase la différence B2B/BtoC pour montrer que vous avez compris le contexte de Manutan avant l'entretien.",
    },
  ],
  pitch:
    "En BTS NDRC, j'ai déjà travaillé sur des indicateurs de performance commerciale — je suis à l'aise aussi bien avec la partie création que la partie analyse des campagnes, ce qui correspond bien à ce que vous recherchez sur ce poste.",
  pointsForts: [
    "Formation orientée relation client B2B, cohérente avec le positionnement de Manutan",
    "Rigueur et goût pour les chiffres, utile pour le reporting demandé",
    "Curiosité pour les outils d'emailing (Mailchimp, Brevo...) déjà testés en cours ou en autonomie",
  ],
  astuces: [
    "Citez un exemple, même scolaire, où vous avez analysé un résultat chiffré (taux, %) pour en tirer une conclusion.",
    "Renseignez-vous sur le catalogue Manutan (fournitures pour professionnels) pour montrer que vous comprenez à qui ils vendent.",
  ],
  questionsProbables: [
    "Qu'est-ce qui vous plaît dans le B2B par rapport au BtoC ?",
    "Avez-vous déjà utilisé un outil d'emailing ou d'analyse de campagne ?",
    "Comment organiseriez-vous votre semaine entre création et reporting ?",
  ],
  questionsARecruteur: [
    "Quels indicateurs suivez-vous en priorité sur vos campagnes ?",
    "Avec quelles équipes (commerciale, data) travaille l'alternant au quotidien ?",
  ],
};

function buildFallbackPrep(app: DemoApplication): DemoPrep {
  const excerpt = app.jobExcerpt;
  return {
    besoinsImplicites: excerpt
      ? [
          {
            extrait: excerpt,
            interpretation: `En insistant sur « ${excerpt} », ${app.company} vous dit concrètement ce qu'il attend en premier sur ce poste de ${app.role} — reprenez ce point avec vos propres mots dès le début de l'entretien.`,
          },
        ]
      : [
          {
            extrait: "",
            interpretation: `L'offre ne précise pas de mission détaillée : posez la question en entretien plutôt que de deviner ce qu'attend ${app.company} sur ce poste de ${app.role}.`,
          },
        ],
    axeDifferenciant: `Appuyez-vous sur une réalisation concrète (projet d'école, job, association) plutôt que sur des qualités générales — c'est ce qui vous distinguera pour le poste de ${app.role} chez ${app.company}.`,
    syntheseAnnonce: `Un poste de ${app.role} chez ${app.company}${excerpt ? `, centré sur : ${excerpt.charAt(0).toLowerCase()}${excerpt.slice(1)}` : ""}`,
    pointsDeVigilance: [
      {
        ecart: `Vous n'avez probablement pas encore d'expérience professionnelle directe en tant que ${app.role}.`,
        conseil: "Préparez un exemple transférable (stage, projet d'école, job étudiant) qui montre une compétence proche, même dans un autre secteur.",
      },
    ],
    pitch: `Étudiant(e) en BTS NDRC, je recherche une alternance de ${app.role} pour mettre en pratique ce que j'apprends en formation. Ce qui m'intéresse chez ${app.company}, c'est [à préciser selon vos motivations réelles].`,
    pointsForts: [
      "Formation en relation client / négociation directement applicable au poste",
      "Capacité d'adaptation rapide, déjà éprouvée sur d'autres expériences",
      "Motivation concrète pour ce secteur, à illustrer par un exemple personnel",
    ],
    astuces: [
      `Renseignez-vous sur l'actualité récente de ${app.company} (site, réseaux sociaux) pour en citer un élément en entretien.`,
      "Préparez une question précise sur le quotidien du poste — ça montre que vous vous projetez vraiment.",
    ],
    questionsProbables: [
      `Pourquoi ${app.company} en particulier ?`,
      "Parlez-moi d'un projet dont vous êtes fier/fière.",
      "Comment gérez-vous les imprévus ou une charge de travail importante ?",
    ],
    questionsARecruteur: ["À quoi ressemble une semaine type sur ce poste ?", "Comment se déroule l'intégration des alternants dans l'équipe ?"],
  };
}

function generatePrepFor(app: DemoApplication): DemoPrep {
  if (app.company === "Decathlon") return DECATHLON_PREP;
  if (app.company === "Manutan") return MANUTAN_PREP;
  return buildFallbackPrep(app);
}

// ----------------------------------------------------------------------------
// Générateur de messages IA (démo) — templates dynamiques par type/ton
// ----------------------------------------------------------------------------
type MessageType = "candidature" | "relance" | "linkedin" | "remerciement";
type MessageTone = "professionnel" | "direct" | "chaleureux";

const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  candidature: "Mail de candidature",
  relance: "Mail de relance",
  linkedin: "Message LinkedIn",
  remerciement: "Mail de remerciement",
};

function generateMessage(type: MessageType, tone: MessageTone, app: DemoApplication): { subject: string; body: string } {
  const greeting = tone === "chaleureux" ? "Bonjour," : "Bonjour,";
  const closing =
    tone === "chaleureux" ? "Belle journée à vous,\nMona Bouzrara" : tone === "direct" ? "Cordialement,\nMona Bouzrara" : "Cordialement,\nMona Bouzrara";

  if (type === "candidature") {
    const opener =
      tone === "chaleureux"
        ? `J'espère que vous allez bien ! Actuellement en BTS NDRC, je me permets de vous adresser ma candidature pour le poste de ${app.role} chez ${app.company}.`
        : tone === "direct"
          ? `Actuellement en BTS NDRC, je vous adresse ma candidature pour le poste de ${app.role}.`
          : `Actuellement en formation BTS NDRC, je me permets de vous adresser ma candidature pour le poste de ${app.role} au sein de ${app.company}.`;
    return {
      subject: `Candidature — ${app.role} en alternance`,
      body: `${greeting}\n\n${opener}\n\n${app.jobExcerpt ? `Votre annonce précise : « ${app.jobExcerpt} » — c'est justement ce type de mission qui m'intéresse et sur lequel je pense pouvoir rapidement être utile.` : "Votre offre correspond exactement à ce que je recherche pour mon alternance."}\n\nJe reste disponible pour un entretien à votre convenance.\n\n${closing}`,
    };
  }

  if (type === "relance") {
    return {
      subject: `Suivi de ma candidature — ${app.role}`,
      body: `${greeting}\n\nJe me permets de revenir vers vous concernant ma candidature envoyée le ${app.appliedDate} pour le poste de ${app.role}. ${
        tone === "direct"
          ? "Où en est le traitement de mon dossier ?"
          : "Je reste très motivée par ce poste et me tiens à votre disposition pour toute information complémentaire."
      }\n\n${closing}`,
    };
  }

  if (type === "linkedin") {
    return {
      subject: "Message LinkedIn",
      body: `Bonjour${app.recruiterName ? ` ${app.recruiterName.split(" ")[0]}` : ""}, je suis étudiante en BTS NDRC et j'ai candidaté au poste de ${app.role} chez ${app.company}. Je me permets de vous contacter directement pour vous confirmer ma motivation — n'hésitez pas si vous avez besoin d'un complément d'information. Belle journée !`,
    };
  }

  // remerciement
  return {
    subject: `Merci pour notre échange — ${app.role}`,
    body: `${greeting}\n\nJe vous remercie pour le temps accordé lors de notre entretien concernant le poste de ${app.role}. Nos échanges ont confirmé mon envie de rejoindre ${app.company}${
      app.jobExcerpt ? `, notamment sur la partie « ${app.jobExcerpt.slice(0, 60)}${app.jobExcerpt.length > 60 ? "…" : ""} »` : ""
    }.\n\nJe reste à votre disposition pour toute question complémentaire.\n\n${closing}`,
  };
}

// ----------------------------------------------------------------------------
// Navigation
// ----------------------------------------------------------------------------
type PageKey = "overview" | "applications" | "offers" | "interview-prep" | "messages" | "school";

const NAV_STUDENT: { key: PageKey; label: string; icon: string }[] = [
  { key: "overview", label: "Vue d'ensemble", icon: "🏠" },
  { key: "applications", label: "Mes candidatures", icon: "📋" },
  { key: "offers", label: "Offres d'alternance", icon: "🔍" },
  { key: "interview-prep", label: "Préparation entretien", icon: "🎤" },
  { key: "messages", label: "Générateur IA", icon: "✨" },
];

const NAV_SCHOOL: { key: PageKey; label: string; icon: string }[] = [{ key: "school", label: "Suivi des étudiants", icon: "🎓" }];

// ============================================================================
// Composant principal
// ============================================================================
export function FasupSchoolDemo() {
  const [activePage, setActivePage] = useState<PageKey>("overview");

  // --- Espace étudiant (persona Mona) ---
  const [myApps, setMyApps] = useState<DemoApplication[]>(MONA_APPS);
  const [selectedPrepAppId, setSelectedPrepAppId] = useState<string>(MONA_APPS[0].id);
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepGenerated, setPrepGenerated] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ revele: true });

  const [msgAppId, setMsgAppId] = useState<string>(MONA_APPS[0].id);
  const [msgType, setMsgType] = useState<MessageType>("candidature");
  const [msgTone, setMsgTone] = useState<MessageTone>("professionnel");
  const [msgResult, setMsgResult] = useState<{ subject: string; body: string } | null>(null);

  const [offerFilterSector, setOfferFilterSector] = useState("");
  const [addForm, setAddForm] = useState<{ open: boolean; company: string; role: string }>({ open: false, company: "", role: "" });

  // --- Espace école ---
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendResult, setSendResult] = useState("");

  const allSelected = selected.size === STUDENTS.length;

  function toggleOne(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(STUDENTS.map((_, i) => i)));
  }
  function applyTemplate(i: number) {
    setSubject(TEMPLATES[i].subject);
    setMessage(TEMPLATES[i].message);
    setSendResult("");
  }

  const openStudent = openIndex !== null ? STUDENTS[openIndex] : null;
  const canSend = selected.size > 0 && subject.trim() !== "" && message.trim() !== "";

  // --- Dérivés espace étudiant ---
  const pendingCount = myApps.filter((a) => a.status === "envoyee" || a.status === "relance_a_faire").length;
  const interviewCount = myApps.filter((a) => a.status === "entretien_obtenu").length;
  const followupsDue = myApps.filter((a) => a.status === "relance_a_faire");
  const weeklyGoal = 5;
  const weeklyPct = Math.min(100, Math.round((myApps.length / weeklyGoal) * 100));

  const selectedPrepApp = myApps.find((a) => a.id === selectedPrepAppId) ?? myApps[0];
  const prep = prepGenerated ? generatePrepFor(selectedPrepApp) : null;

  const msgApp = myApps.find((a) => a.id === msgAppId) ?? myApps[0];

  const sectors = Array.from(new Set(OFFERS.map((o) => o.sector)));
  const filteredOffers = offerFilterSector ? OFFERS.filter((o) => o.sector === offerFilterSector) : OFFERS;

  function advanceStatus(id: string) {
    setMyApps((prev) => prev.map((a) => (a.id === id && NEXT_STATUS[a.status] ? { ...a, status: NEXT_STATUS[a.status]! } : a)));
  }
  function markRefused(id: string) {
    setMyApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: "refus" } : a)));
  }
  function addApplication(company: string, role: string) {
    if (!company.trim() || !role.trim()) return;
    const id = `custom-${Date.now()}`;
    setMyApps((prev) => [...prev, { id, company: company.trim(), role: role.trim(), status: "a_candidater", appliedDate: "—" }]);
    setAddForm({ open: false, company: "", role: "" });
  }
  function addOfferToTracking(offer: (typeof OFFERS)[number]) {
    const already = myApps.some((a) => a.company === offer.company && a.role === offer.role);
    if (already) return;
    const id = `offer-${Date.now()}`;
    setMyApps((prev) => [
      ...prev,
      { id, company: offer.company, role: offer.role, status: "a_candidater", appliedDate: "—", jobExcerpt: offer.jobExcerpt },
    ]);
  }

  function generatePrep() {
    setPrepLoading(true);
    setPrepGenerated(false);
    setTimeout(() => {
      setPrepLoading(false);
      setPrepGenerated(true);
      setOpenSections({ revele: true });
    }, 900);
  }

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      {/* Bandeau de démo */}
      <div className="border-b border-line bg-white px-4 py-2 text-center text-[11px] text-muted">
        Démo interactive — données fictives, aperçu complet des fonctionnalités pour FASUP&apos; Bordeaux
      </div>

      {/* En-tête FASUP */}
      <div className="border-b border-line bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/partenaires/fasup-logo.png"
              alt="Logo FASUP'"
              width={44}
              height={44}
              className="h-11 w-11 rounded-xl object-cover shadow-sm"
            />
            <div>
              <h1 className="text-lg font-bold text-ink">Attitude Alternance × FASUP&apos; Bordeaux</h1>
              <p className="text-xs text-muted">
                {activePage === "school" ? "Connecté en tant qu'établissement · FASUP' Bordeaux" : "Connecté en tant qu'étudiante · Mona Bouzrara — BTS NDRC 2ᵉ année"}
              </p>
            </div>
          </div>
          <div
            className="hidden h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white sm:flex"
            style={{ backgroundColor: FASUP_DARK }}
          >
            {activePage === "school" ? "FA" : "MB"}
          </div>
        </div>
      </div>

      {/* Nav mobile */}
      <div className="border-b border-line bg-white px-4 py-2 md:hidden">
        <select
          value={activePage}
          onChange={(e) => setActivePage(e.target.value as PageKey)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        >
          <optgroup label="Espace étudiant (démo : Mona Bouzrara)">
            {NAV_STUDENT.map((n) => (
              <option key={n.key} value={n.key}>
                {n.icon} {n.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Espace école">
            {NAV_SCHOOL.map((n) => (
              <option key={n.key} value={n.key}>
                {n.icon} {n.label}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar desktop */}
        <aside className="hidden w-60 flex-shrink-0 md:block">
          <p className="mb-2 px-2 text-[10.5px] font-semibold uppercase tracking-wide text-muted">Espace étudiant</p>
          <p className="mb-2 px-2 text-[10.5px] text-muted/70">démo : Mona Bouzrara</p>
          <nav className="flex flex-col gap-1">
            {NAV_STUDENT.map((n) => (
              <button
                key={n.key}
                type="button"
                onClick={() => setActivePage(n.key)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors"
                style={
                  activePage === n.key
                    ? { backgroundColor: FASUP_DARK, color: "white" }
                    : { color: "#4B4136" }
                }
              >
                <span>{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>

          <p className="mb-2 mt-6 px-2 text-[10.5px] font-semibold uppercase tracking-wide text-muted">Espace école</p>
          <nav className="flex flex-col gap-1">
            {NAV_SCHOOL.map((n) => (
              <button
                key={n.key}
                type="button"
                onClick={() => setActivePage(n.key)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors"
                style={activePage === n.key ? { backgroundColor: FASUP_AMBER, color: FASUP_DARK } : { color: "#4B4136" }}
              >
                <span>{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenu */}
        <main className="min-w-0 flex-1">
          {activePage === "overview" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-ink">Bonjour Mona 👋</h2>
                <p className="text-sm text-muted">Voici un aperçu de ce que verrait une étudiante FASUP&apos; sur son tableau de bord.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard n={String(pendingCount)} label="En attente de réponse" />
                <StatCard n={String(interviewCount)} label="Entretiens obtenus" />
                <StatCard n={String(followupsDue.length)} label="Relances à faire" highlight />
              </div>

              <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">Objectif de la semaine</p>
                  <span className="text-xs text-muted">
                    {myApps.length} / {weeklyGoal} candidatures
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${weeklyPct}%`, backgroundColor: weeklyPct >= 100 ? "#2F9E60" : FASUP_AMBER }}
                  />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-line bg-white p-5 shadow-sm lg:col-span-2">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink">À traiter aujourd&apos;hui</h3>
                    <button onClick={() => setActivePage("applications")} className="text-xs font-medium" style={{ color: FASUP_DARK }}>
                      Voir tout →
                    </button>
                  </div>
                  {followupsDue.length === 0 ? (
                    <p className="text-sm text-muted">Aucune relance en attente — vous êtes à jour !</p>
                  ) : (
                    <ul className="space-y-2">
                      {followupsDue.map((a) => (
                        <li key={a.id} className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">{a.company}</p>
                            <p className="truncate text-xs text-muted">{a.role}</p>
                          </div>
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">Relance à faire</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-ink">Accès rapide</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    {[
                      { key: "messages" as PageKey, icon: "✨", label: "Générer un message" },
                      { key: "interview-prep" as PageKey, icon: "🎤", label: "Préparer un entretien" },
                      { key: "offers" as PageKey, icon: "🔍", label: "Chercher une offre" },
                      { key: "applications" as PageKey, icon: "📋", label: "Mes candidatures" },
                    ].map((l) => (
                      <button
                        key={l.key}
                        type="button"
                        onClick={() => setActivePage(l.key)}
                        className="flex flex-col gap-2 rounded-xl border border-line px-3 py-3 text-left transition-colors hover:bg-[#F6F7FB]"
                      >
                        <span className="text-lg">{l.icon}</span>
                        <span className="text-xs font-medium leading-snug text-ink">{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-muted">
                Le produit complet inclut aussi un score de correspondance IA, un vérificateur d&apos;offres frauduleuses et une bibliothèque de
                ressources — non repris dans cette démo rapide, mais disponibles dans l&apos;outil réel si utile de les montrer aussi.
              </p>
            </div>
          )}

          {activePage === "applications" && (
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-ink">Mes candidatures</h2>
                  <p className="text-sm text-muted">Centralisez et suivez chaque candidature, de la prise de contact à la réponse finale.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddForm((f) => ({ ...f, open: !f.open }))}
                  className="flex-shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: FASUP_DARK }}
                >
                  + Ajouter
                </button>
              </div>

              {addForm.open && (
                <div className="mb-5 rounded-2xl border border-line bg-white p-4 shadow-sm">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      value={addForm.company}
                      onChange={(e) => setAddForm((f) => ({ ...f, company: e.target.value }))}
                      placeholder="Entreprise"
                      className="rounded-lg border border-line px-3 py-2 text-sm"
                    />
                    <input
                      value={addForm.role}
                      onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
                      placeholder="Poste"
                      className="rounded-lg border border-line px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => addApplication(addForm.company, addForm.role)}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-white"
                      style={{ backgroundColor: FASUP_AMBER, color: FASUP_DARK }}
                    >
                      Ajouter la candidature
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto pb-2">
                <div className="grid grid-flow-col auto-cols-[240px] gap-3">
                  {KANBAN_COLUMNS.map((status) => {
                    const apps = myApps.filter((a) => a.status === status);
                    return (
                      <div key={status} className="rounded-2xl border border-line bg-white p-3 shadow-sm">
                        <div className="mb-2 flex items-center justify-between px-1">
                          <span className="text-xs font-semibold text-ink">{STATUS_LABELS[status]}</span>
                          <span className="text-[10.5px] text-muted">{apps.length}</span>
                        </div>
                        <div className="space-y-2">
                          {apps.map((a) => (
                            <div key={a.id} className="rounded-xl border border-line bg-[#FAFAFB] p-3">
                              <p className="text-sm font-medium text-ink">{a.company}</p>
                              <p className="text-xs text-muted">{a.role}</p>
                              <p className="mt-1 text-[10.5px] text-muted">{a.appliedDate}</p>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {NEXT_STATUS[a.status] && (
                                  <button
                                    type="button"
                                    onClick={() => advanceStatus(a.id)}
                                    className="rounded-lg border border-line bg-white px-2 py-1 text-[10.5px] font-medium"
                                    style={{ color: FASUP_DARK }}
                                  >
                                    Avancer →
                                  </button>
                                )}
                                {a.status !== "refus" && a.status !== "accepte" && (
                                  <button
                                    type="button"
                                    onClick={() => markRefused(a.id)}
                                    className="rounded-lg border border-line bg-white px-2 py-1 text-[10.5px] font-medium text-muted"
                                  >
                                    Marquer refusée
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          {apps.length === 0 && <p className="px-1 text-[11px] text-muted">Aucune candidature</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activePage === "offers" && (
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-ink">Offres d&apos;alternance</h2>
                <p className="text-sm text-muted">Offres filtrées par secteur — ajoutez-les directement à votre suivi en un clic.</p>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setOfferFilterSector("")}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium"
                  style={offerFilterSector === "" ? { backgroundColor: FASUP_DARK, color: "white", borderColor: FASUP_DARK } : { borderColor: "#E5E1DA" }}
                >
                  Tous secteurs
                </button>
                {sectors.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setOfferFilterSector(s)}
                    className="rounded-full border px-3 py-1.5 text-xs font-medium"
                    style={offerFilterSector === s ? { backgroundColor: FASUP_DARK, color: "white", borderColor: FASUP_DARK } : { borderColor: "#E5E1DA" }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {filteredOffers.map((o) => {
                  const already = myApps.some((a) => a.company === o.company && a.role === o.role);
                  return (
                    <div key={`${o.company}-${o.role}`} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-ink">{o.role}</p>
                          <p className="text-xs text-muted">
                            {o.company} · {o.city}
                          </p>
                        </div>
                        <span className="flex-shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-[10.5px] text-slate-500">Il y a {o.postedDaysAgo}j</span>
                      </div>
                      <p className="mt-2 text-xs text-ink/70">{o.jobExcerpt}</p>
                      <button
                        type="button"
                        disabled={already}
                        onClick={() => addOfferToTracking(o)}
                        className="mt-3 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundColor: already ? "#9CA3AF" : FASUP_DARK }}
                      >
                        {already ? "✓ Déjà dans mon suivi" : "+ Ajouter à mon suivi"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activePage === "interview-prep" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-ink">Préparation d&apos;entretien IA</h2>
                <p className="text-sm text-muted">Une analyse détaillée de l&apos;offre, pas des conseils génériques.</p>
              </div>

              <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                <label className="text-xs font-medium text-muted">Pour quelle candidature ?</label>
                <select
                  value={selectedPrepAppId}
                  onChange={(e) => {
                    setSelectedPrepAppId(e.target.value);
                    setPrepGenerated(false);
                  }}
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
                >
                  {myApps.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.company} — {a.role}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={generatePrep}
                  disabled={prepLoading}
                  className="mt-3 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                  style={{ backgroundColor: FASUP_DARK }}
                >
                  {prepLoading ? "Génération en cours..." : "Générer ma préparation"}
                </button>
              </div>

              {prepLoading && (
                <div className="rounded-2xl border border-line bg-white p-6 text-center text-sm text-muted shadow-sm">
                  Lecture de l&apos;annonce... analyse du profil... préparation des questions probables...
                </div>
              )}

              {prep && !prepLoading && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <SummaryPill icon="⭐" label="Votre axe" text={prep.axeDifferenciant} onClick={() => setOpenSections((s) => ({ ...s, axe: true }))} />
                    <SummaryPill
                      icon="⚠️"
                      label="À anticiper"
                      text={prep.pointsDeVigilance[0]?.ecart ?? ""}
                      onClick={() => setOpenSections((s) => ({ ...s, vigilance: true }))}
                    />
                    <SummaryPill
                      icon="💡"
                      label="Astuce clé"
                      text={prep.astuces[0] ?? ""}
                      onClick={() => setOpenSections((s) => ({ ...s, astuces: true }))}
                    />
                  </div>

                  <AccordionSection
                    title="🔎 Ce que l'annonce révèle vraiment"
                    isOpen={!!openSections.revele}
                    onToggle={() => toggleSection("revele")}
                  >
                    <ul className="space-y-3 text-sm text-ink/85">
                      {prep.besoinsImplicites.map((item, i) => (
                        <li key={i} className="border-l-2 pl-3" style={{ borderColor: FASUP_AMBER }}>
                          {item.extrait && <p className="italic text-ink/60">« {item.extrait} »</p>}
                          <p className={item.extrait ? "mt-1" : ""}>{item.interpretation}</p>
                        </li>
                      ))}
                    </ul>
                  </AccordionSection>

                  <AccordionSection title="⭐ Votre axe différenciant" isOpen={!!openSections.axe} onToggle={() => toggleSection("axe")} emphasis>
                    <p className="text-sm font-medium text-ink">{prep.axeDifferenciant}</p>
                  </AccordionSection>

                  <AccordionSection title="🏢 Le poste en bref" isOpen={!!openSections.poste} onToggle={() => toggleSection("poste")}>
                    <p className="text-sm text-ink/85">{prep.syntheseAnnonce}</p>
                  </AccordionSection>

                  <AccordionSection title="⚠️ Points de vigilance à anticiper" isOpen={!!openSections.vigilance} onToggle={() => toggleSection("vigilance")} warn>
                    <ul className="space-y-3 text-sm text-ink/85">
                      {prep.pointsDeVigilance.map((item, i) => (
                        <li key={i}>
                          <p className="font-medium text-ink">{item.ecart}</p>
                          <p className="mt-1 text-ink/75">→ {item.conseil}</p>
                        </li>
                      ))}
                    </ul>
                  </AccordionSection>

                  <AccordionSection title="🎤 Votre pitch" isOpen={!!openSections.pitch} onToggle={() => toggleSection("pitch")}>
                    <p className="text-sm italic text-ink/85">{prep.pitch}</p>
                  </AccordionSection>

                  <AccordionSection title="💪 Vos autres points forts" isOpen={!!openSections.pointsForts} onToggle={() => toggleSection("pointsForts")}>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-ink/85">
                      {prep.pointsForts.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </AccordionSection>

                  <AccordionSection title="❓ Questions probables" isOpen={!!openSections.questions} onToggle={() => toggleSection("questions")}>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-ink/85">
                      {prep.questionsProbables.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </AccordionSection>

                  <AccordionSection title="🎯 Questions à poser au recruteur" isOpen={!!openSections.questionsRecruteur} onToggle={() => toggleSection("questionsRecruteur")}>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-ink/85">
                      {prep.questionsARecruteur.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </AccordionSection>
                </div>
              )}
            </div>
          )}

          {activePage === "messages" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-ink">Générateur de messages IA</h2>
                <p className="text-sm text-muted">Créez en quelques secondes un mail ou un message LinkedIn prêt à copier-coller.</p>
              </div>

              <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-medium text-muted">Candidature</label>
                    <select value={msgAppId} onChange={(e) => setMsgAppId(e.target.value)} className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm">
                      {myApps.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.company} — {a.role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted">Type de message</label>
                    <select
                      value={msgType}
                      onChange={(e) => setMsgType(e.target.value as MessageType)}
                      className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
                    >
                      {Object.entries(MESSAGE_TYPE_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted">Ton</label>
                    <select
                      value={msgTone}
                      onChange={(e) => setMsgTone(e.target.value as MessageTone)}
                      className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
                    >
                      <option value="professionnel">Professionnel</option>
                      <option value="direct">Direct</option>
                      <option value="chaleureux">Chaleureux</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMsgResult(generateMessage(msgType, msgTone, msgApp))}
                  className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
                  style={{ backgroundColor: FASUP_DARK }}
                >
                  Générer le message
                </button>
              </div>

              {msgResult && (
                <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-muted">Sujet</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{msgResult.subject}</p>
                  <p className="mt-3 text-xs font-medium text-muted">Message</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-ink/85">{msgResult.body}</p>
                </div>
              )}
            </div>
          )}

          {activePage === "school" && (
            <div>
              {/* Stats */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["56", "Étudiants inscrits"],
                  ["340", "Candidatures envoyées"],
                  ["64%", "Objectif hebdo atteint en moyenne"],
                  ["38", "Ayant partagé le détail"],
                ].map(([n, label]) => (
                  <div key={label} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                    <div className="text-2xl font-extrabold" style={{ color: FASUP_DARK }}>
                      {n}
                    </div>
                    <div className="mt-1 text-[11px] text-muted">{label}</div>
                  </div>
                ))}
              </div>

              {/* Tableau étudiants */}
              <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-ink">Étudiants</h2>
                <p className="mt-1 text-xs text-muted">
                  Le détail des candidatures n&apos;est visible que pour les étudiants ayant activé le partage.
                </p>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-[10.5px] font-semibold uppercase tracking-wide text-muted">
                        <th className="w-8 py-2 pr-2">
                          <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded border-line" />
                        </th>
                        <th className="py-2 pr-4">Nom</th>
                        <th className="py-2 pr-4">Formation</th>
                        <th className="py-2 pr-4">Objectif hebdo</th>
                        <th className="py-2 pr-4">Candidatures</th>
                        <th className="py-2 pr-4">Progression</th>
                        <th className="py-2 pr-4">Relances</th>
                        <th className="py-2 pr-4">Partage</th>
                        <th className="py-2 pr-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {STUDENTS.map((s, i) => {
                        const done = studentDone(s);
                        const relances = studentRelances(s);
                        const pct = Math.min(100, Math.round((done / s.goal) * 100));
                        return (
                          <tr
                            key={s.id}
                            className={s.shared ? "cursor-pointer hover:bg-[#F6F7FB]" : "opacity-70"}
                            onClick={() => s.shared && setOpenIndex(i)}
                          >
                            <td className="py-2.5 pr-2" onClick={(e) => e.stopPropagation()}>
                              <input type="checkbox" checked={selected.has(i)} onChange={() => toggleOne(i)} className="h-4 w-4 rounded border-line" />
                            </td>
                            <td className="py-2.5 pr-4 font-medium text-ink">{s.name}</td>
                            <td className="py-2.5 pr-4 text-ink/70">{s.formation}</td>
                            <td className="py-2.5 pr-4 text-ink/80">{s.goal} / semaine</td>
                            <td className="py-2.5 pr-4 text-ink/80">{done}</td>
                            <td className="py-2.5 pr-4">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-line">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? "#2F9E60" : FASUP_AMBER }}
                                  />
                                </div>
                                <span className="text-[11px] text-muted">{pct}%</span>
                              </div>
                            </td>
                            <td className="py-2.5 pr-4">
                              {s.shared ? (
                                relances > 0 ? (
                                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">⚠️ {relances}</span>
                                ) : (
                                  <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">À jour</span>
                                )
                              ) : (
                                <span className="text-[11px] text-muted">—</span>
                              )}
                            </td>
                            <td className="py-2.5 pr-4">
                              {s.shared ? (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">✓ Partagé</span>
                              ) : (
                                <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">🔒 Non partagé</span>
                              )}
                            </td>
                            <td className="py-2.5 pr-4" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                disabled={!s.shared}
                                onClick={() => s.shared && setOpenIndex(i)}
                                className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
                                style={s.shared ? { color: FASUP_DARK } : undefined}
                              >
                                Voir le détail
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Module mailing */}
              <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-ink">Envoyer un email groupé</h2>
                <p className="mt-1 text-xs text-muted">{selected.size} étudiant(s) sélectionné(s) recevront cet email.</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {TEMPLATES.map((t, i) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => applyTemplate(i)}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium"
                      style={{ color: FASUP_DARK }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted">Sujet</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Objet de l'email"
                      className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      placeholder="Votre message..."
                      className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    disabled={!canSend}
                    onClick={() => setSendResult(`Envoyé à ${selected.size} étudiant(s) — (démo, aucun email réel envoyé).`)}
                    className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ backgroundColor: FASUP_DARK }}
                  >
                    Envoyer à {selected.size} étudiant(s)
                  </button>
                  {sendResult && <span className="text-xs font-medium text-emerald-600">{sendResult}</span>}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Panneau détail étudiant (espace école) */}
      {openStudent && (
        <>
          <div className="fixed inset-0 z-30 bg-ink/30" onClick={() => setOpenIndex(null)} />
          <div className="fixed bottom-0 right-0 top-0 z-40 w-full max-w-md overflow-y-auto bg-[#F6F7FB] shadow-2xl">
            <div className="sticky top-0 border-b border-line bg-white p-5">
              <button type="button" onClick={() => setOpenIndex(null)} className="absolute right-4 top-4 text-lg text-muted" aria-label="Fermer">
                ✕
              </button>
              <h3 className="text-base font-bold text-ink">{openStudent.name}</h3>
              <p className="mt-1 text-xs text-muted">
                {openStudent.formation} · Promo {openStudent.promo}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10.5px] text-slate-600">Dernière activité : {openStudent.lastActive}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10.5px] ${
                    openStudent.cvUploaded ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {openStudent.cvUploaded ? "✓ CV à jour" : "⚠️ CV non déposé"}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted">
                {(openStudent.apps ?? []).length} candidature(s) — objectif {openStudent.goal}/semaine
              </p>
            </div>
            <div className="p-5">
              {!openStudent.apps || openStudent.apps.length === 0 ? (
                <p className="text-sm text-muted">Aucune candidature enregistrée pour l&apos;instant.</p>
              ) : (
                <div className="space-y-3">
                  {openStudent.apps.map((a) => (
                    <div key={a.id} className="rounded-xl border border-line bg-white p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-bold text-ink">{a.company}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${STATUS_STYLES[a.status]}`}>
                          {STATUS_LABELS[a.status]}
                        </span>
                      </div>
                      <div className="mb-2 text-xs text-muted">{a.role}</div>
                      <div className="text-[11px] text-muted">Candidature : {a.appliedDate}</div>
                      {a.recruiterName && (
                        <div className="mt-1 text-[11px] text-muted">
                          Contact : {a.recruiterName}
                          {a.recruiterEmail ? ` · ${a.recruiterEmail}` : ""}
                        </div>
                      )}
                      {a.status === "relance_a_faire" && (
                        <div className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-[10.5px] font-medium text-amber-700">⏳ Relance non effectuée</div>
                      )}
                      {a.comment && <div className="mt-2 text-[11px] italic text-ink/60">{a.comment}</div>}
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-4 text-[10.5px] text-muted">
                Aperçu figé (démo) — dans l&apos;outil réel, ces données se mettent à jour en direct au fil des candidatures de l&apos;étudiant·e.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Sous-composants
// ----------------------------------------------------------------------------
function StatCard({ n, label, highlight }: { n: string; label: string; highlight?: boolean }) {
  return (
    <div
      className="rounded-2xl border p-4 shadow-sm"
      style={highlight ? { borderColor: `${FASUP_AMBER}66`, backgroundColor: "#FFF8EC" } : { borderColor: "#E5E1DA", backgroundColor: "white" }}
    >
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold" style={{ color: FASUP_DARK }}>
        {n}
      </p>
    </div>
  );
}

function SummaryPill({ icon, label, text, onClick }: { icon: string; label: string; text: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border p-3 text-left text-xs leading-snug shadow-sm transition-shadow hover:shadow-md"
      style={{ borderColor: "#E5E1DA", backgroundColor: "#FFF8EC" }}
    >
      <span className="mb-1 flex items-center gap-1.5 font-semibold" style={{ color: FASUP_DARK }}>
        <span>{icon}</span>
        <span>{label}</span>
      </span>
      <span className="line-clamp-2 block text-ink/80">{text}</span>
    </button>
  );
}

function AccordionSection({
  title,
  isOpen,
  onToggle,
  children,
  emphasis,
  warn,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  emphasis?: boolean;
  warn?: boolean;
}) {
  const containerStyle = emphasis
    ? { border: `2px solid ${FASUP_DARK}`, backgroundColor: "#FFF8EC" }
    : warn
      ? { border: "1px solid #FDE68A", backgroundColor: "#FFFBEB" }
      : { border: "1px solid #E5E1DA", backgroundColor: "white" };

  return (
    <div className="overflow-hidden rounded-2xl shadow-sm" style={containerStyle}>
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left">
        <span className="text-sm font-semibold" style={{ color: emphasis ? FASUP_DARK : "#1F1B16" }}>
          {title}
        </span>
        <span className={`text-xs text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden>
          ▾
        </span>
      </button>
      {isOpen && <div className="-mt-1 px-6 pb-6">{children}</div>}
    </div>
  );
}
