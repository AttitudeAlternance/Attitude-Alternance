import type { MessageTone, MessageType } from "@/lib/types";

export interface GenerateMessageParams {
  type: MessageType;
  company: string;
  role: string;
  recruiterName?: string;
  tone: MessageTone;
  personalInfo?: string;
  firstName?: string;
  lastName?: string;
  formation?: string;
  jobDescription?: string;
  cvSummary?: string;
  previousMessage?: string;
  variantSeed?: number;
}

export interface GenerateMessageResult {
  content: string;
  usedRealAi: boolean;
}

/**
 * Point d'entrée unique pour la génération de messages.
 *
 * Si ANTHROPIC_API_KEY est configurée (dans .env.local ou dans les variables
 * d'environnement Vercel), le message est rédigé par une vraie IA (Claude),
 * qui comprend réellement l'annonce et le CV pour un résultat naturel.
 *
 * Sans clé configurée, un générateur local (basé sur des modèles de phrases)
 * prend le relais : il fonctionne, mais reste plus mécanique.
 */
export async function generateMessage(params: GenerateMessageParams): Promise<GenerateMessageResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const content = await generateWithClaude(params, apiKey);
      return { content, usedRealAi: true };
    } catch (err) {
      console.error("Erreur lors de l'appel à l'API Anthropic, repli sur le générateur local :", err);
      return { content: generatePlaceholderMessage(params), usedRealAi: false };
    }
  }

  return { content: generatePlaceholderMessage(params), usedRealAi: false };
}

// ----------------------------------------------------------------------------
// Génération réelle via l'API Anthropic (Claude)
// ----------------------------------------------------------------------------
async function generateWithClaude(params: GenerateMessageParams, apiKey: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPrompt(params) }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.content?.find((block: { type: string }) => block.type === "text")?.text;
  if (!text) throw new Error("Réponse Anthropic vide ou inattendue");
  return text.trim();
}

const SYSTEM_PROMPT = `Tu es un assistant qui aide des étudiants à rédiger des messages pour leur recherche d'alternance (mails de candidature, relances, messages LinkedIn, remerciements post-entretien).

Règles impératives :
- Écris en français, dans un style humain, naturel et fluide — jamais robotique, jamais de formules toutes faites répétées mécaniquement.
- Reste clair, simple et direct : des phrases courtes, un message qui va à l'essentiel plutôt qu'un texte qui tourne autour du pot.
- Base-toi réellement sur le contenu de l'annonce et du CV fournis (s'ils sont donnés) pour montrer une vraie compréhension des missions du poste et du profil du candidat — ne te contente pas de recopier des mots-clés, reformule et fais des liens pertinents.
- Ne mets aucun placeholder du type [xxx] : le texte doit être prêt à copier-coller tel quel.
- Ne mets pas de titre ni d'objet, uniquement le corps du message.
- Respecte le ton demandé (professionnel, direct, ou chaleureux) sans devenir excessif dans un sens ou dans l'autre.
- Le message doit rester impactant et adapter sa longueur au canal : un mail (candidature, relance, remerciement) peut compter plusieurs paragraphes courts, un message LinkedIn doit rester court et direct. Les consignes de format données plus bas dans le message priment sur cette règle générale.`;

// Construit le prompt envoyé à l'IA, avec tout le contexte disponible.
export function buildPrompt(params: GenerateMessageParams): string {
  const {
    type,
    company,
    role,
    recruiterName,
    tone,
    personalInfo,
    firstName,
    lastName,
    formation,
    jobDescription,
    cvSummary,
  } = params;

  return [
    `Rédige un ${labelForType(type)} pour un étudiant qui recherche une alternance.`,
    typeSpecificInstruction(type),
    `Entreprise ciblée : ${company}`,
    `Poste visé : ${role}`,
    recruiterName ? `Recruteur destinataire : ${recruiterName}` : "Pas de nom de recruteur connu — utilise une formule de politesse neutre.",
    `Ton souhaité : ${tone}`,
    `Signataire : ${[firstName, lastName].filter(Boolean).join(" ") || "L'étudiant"}`,
    formation ? `Formation actuelle du candidat : ${formation}` : "",
    personalInfo ? `Informations personnelles supplémentaires à intégrer si pertinent : ${personalInfo}` : "",
    jobDescription
      ? `Texte de l'annonce (utilise-le pour comprendre les vraies missions et montrer une correspondance sincère, sans le citer mot pour mot) :\n"""\n${jobDescription}\n"""`
      : "",
    cvSummary
      ? `Résumé du profil du candidat extrait de son CV (utilise-le pour choisir les compétences/expériences les plus pertinentes par rapport au poste) :\n"""\n${cvSummary}\n"""`
      : "",
    params.previousMessage
      ? `Voici une version déjà proposée précédemment :\n"""\n${params.previousMessage}\n"""\nL'étudiant souhaite une autre proposition. Garde les mêmes informations de fond et le même ton, mais varie clairement la formulation, l'angle d'accroche ou l'organisation des idées, pour que ce ne soit pas une simple reformulation de surface.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

// Consignes propres à chaque type de message, pour éviter un rendu uniforme
// quel que soit le canal ou le contexte (un LinkedIn n'est pas un mail, un
// remerciement post-entretien n'a pas besoin de revendre le CV).
function typeSpecificInstruction(type: MessageType): string {
  switch (type) {
    case "candidature":
      return "Format attendu : longueur d'un vrai mail de candidature (plusieurs paragraphes courts), qui développe sincèrement le lien entre le profil et le poste.";
    case "linkedin":
      return "Format attendu : message LinkedIn court (3 à 5 phrases, pas de formule de politesse type mail), mais qui prend quand même le temps de faire un vrai lien entre le profil du candidat et le poste, dans les grandes lignes — évite une phrase unique et vague, sans pour autant écrire un mail complet.";
    case "remerciement":
      return "Format attendu : mail de remerciement post-entretien. Ne reviens pas sur les compétences ou l'expérience du candidat (déjà évoquées pendant l'entretien) : concentre-toi sur la qualité de l'échange, la motivation confirmée pour le poste, et la suite attendue.";
    case "relance":
      return "Format attendu : mail de relance court et courtois, qui rappelle la candidature sans la réexpliquer en détail.";
  }
}

function labelForType(type: MessageType) {
  switch (type) {
    case "candidature":
      return "mail de candidature spontanée / motivée pour une alternance";
    case "relance":
      return "mail de relance après une candidature envoyée sans réponse";
    case "linkedin":
      return "message LinkedIn court destiné à un recruteur ou un contact";
    case "remerciement":
      return "mail de remerciement envoyé après un entretien";
  }
}

// ----------------------------------------------------------------------------
// Générateur local (repli). Utilisé uniquement si aucune clé ANTHROPIC_API_KEY
// n'est configurée, pour que la fonctionnalité reste utilisable dans tous les cas.
// ----------------------------------------------------------------------------

// Extrait une phrase représentative de l'annonce, en priorisant les phrases
// qui parlent de la mission / du profil recherché plutôt que la présentation
// générale de l'entreprise (souvent en tête d'annonce).
function extractJobHighlight(jobDescription?: string): string | null {
  if (!jobDescription) return null;
  const cleaned = jobDescription.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);

  if (sentences.length === 0) return null;

  const missionKeywords = /(mission|recherch|profil|vous serez|vous aurez|en charge|responsab|tâche|compétence|vos activit|vos princip)/i;
  const candidate = sentences.find((s) => missionKeywords.test(s)) ?? sentences[0];

  const maxLength = 170;
  if (candidate.length <= maxLength) return candidate;

  const truncated = candidate.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 40 ? lastSpace : maxLength)}…`;
}

function generatePlaceholderMessage(params: GenerateMessageParams): string {
  const {
    type,
    company,
    role,
    recruiterName,
    tone,
    personalInfo,
    firstName,
    lastName,
    formation,
    jobDescription,
    cvSummary,
    variantSeed,
  } = params;

  const variant = (variantSeed ?? 0) % 2;

  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Prénom Nom";
  const greetingName = recruiterName ? recruiterName : "Madame, Monsieur";
  const politeOpen = tone === "chaleureux" ? `Bonjour ${greetingName},` : `Bonjour${recruiterName ? ` ${recruiterName}` : ""},`;
  const signatureBlock = [fullName, formation ? formation : ""].filter(Boolean).join("\n");
  const jobHighlight = extractJobHighlight(jobDescription);
  const cvLine = cvSummary ? cvSummary.split(/\n|\.\s/)[0]?.trim() : null;

  switch (type) {
    case "candidature": {
      const intro = variant === 0
        ? toneSentence(
            tone,
            `Je me permets de vous contacter concernant une opportunité d'alternance en tant que ${role} au sein de ${company}.`,
            `Je vous écris pour candidater directement au poste de ${role} chez ${company}, qui correspond exactement à ce que je recherche.`,
            `C'est avec grand enthousiasme que je me tourne vers ${company} pour vous proposer ma candidature au poste de ${role} en alternance.`
          )
        : toneSentence(
            tone,
            `Votre offre de ${role} chez ${company} a retenu toute mon attention, et je souhaite vous soumettre ma candidature en alternance.`,
            `Je candidate au poste de ${role} chez ${company} : le profil recherché correspond précisément à ce que je peux apporter.`,
            `${company} est une entreprise qui m'inspire, et c'est avec plaisir que je vous adresse ma candidature pour le poste de ${role} en alternance.`
          );

      const jobLink = jobHighlight
        ? `Votre annonce précise notamment que ${jobHighlight.charAt(0).toLowerCase()}${jobHighlight.slice(1).replace(/[.!?]+$/, "")} — un aspect qui correspond directement à mon profil et à ce que je souhaite développer en alternance.`
        : null;

      const formationLine = formation
        ? `Actuellement en ${formation}, je recherche une alternance me permettant de mettre en pratique mes compétences tout en continuant à me former sur le terrain.`
        : `Je recherche actuellement une alternance me permettant de mettre en pratique mes compétences tout en continuant à me former sur le terrain.`;

      const skillsLine = cvLine
        ? `Mon parcours m'a notamment permis de développer : ${cvLine.toLowerCase()}.`
        : personalInfo
          ? `Concrètement, ${personalInfo.charAt(0).toLowerCase()}${personalInfo.slice(1)}`
          : null;

      const motivationLine = variant === 0
        ? `Rejoindre ${company} représente pour moi une réelle opportunité de contribuer à vos projets tout en progressant au contact d'une équipe expérimentée.`
        : `Intégrer ${company} me permettrait de mettre mes compétences au service de vos projets, tout en continuant à progresser aux côtés d'une équipe expérimentée.`;

      return [
        politeOpen,
        "",
        intro,
        jobLink,
        formationLine,
        skillsLine,
        motivationLine,
        "",
        "Je me tiens à votre disposition pour un entretien afin de vous présenter plus en détail mon parcours et ma motivation.",
        "Je vous remercie par avance pour l'attention portée à ma candidature et reste dans l'attente de votre retour.",
        "",
        "Cordialement,",
        signatureBlock,
      ]
        .filter(Boolean)
        .join("\n");
    }

    case "relance":
      return [
        politeOpen,
        "",
        toneSentence(
          tone,
          `Je me permets de revenir vers vous suite à ma candidature envoyée pour le poste de ${role} au sein de ${company}, afin de savoir si celle-ci a bien été étudiée.`,
          `Je fais suite à ma candidature pour le poste de ${role} chez ${company} : où en est le traitement de mon dossier ?`,
          `J'espère que vous allez bien. Je souhaitais simplement prendre de vos nouvelles concernant ma candidature pour le poste de ${role} chez ${company}.`
        ),
        "Mon intérêt pour ce poste et pour votre entreprise reste intact, et je reste bien entendu disponible pour toute information complémentaire ou pour un entretien.",
        personalInfo ? personalInfo : "",
        "",
        "Je vous remercie par avance pour votre retour et vous souhaite une excellente journée.",
        "",
        "Cordialement,",
        signatureBlock,
      ]
        .filter(Boolean)
        .join("\n");

    case "linkedin":
      return [
        `Bonjour${recruiterName ? ` ${recruiterName}` : ""},`,
        "",
        toneSentence(
          tone,
          `Je vous contacte car je recherche actuellement une alternance en tant que ${role}, et le poste chez ${company} a particulièrement retenu mon attention.`,
          `Je recherche une alternance en ${role} et j'aimerais candidater chez ${company}. Auriez-vous 10 minutes pour en discuter ?`,
          `J'ai suivi avec intérêt l'actualité de ${company} et je serais ravi(e) d'échanger avec vous sur une opportunité d'alternance en ${role}.`
        ),
        personalInfo ? personalInfo : "Je serais ravi(e) d'échanger avec vous à ce sujet, même brièvement.",
        "",
        `Belle journée, ${firstName || ""}`.trim(),
      ]
        .filter(Boolean)
        .join("\n");

    case "remerciement":
      return [
        politeOpen,
        "",
        toneSentence(
          tone,
          `Je vous remercie pour le temps que vous m'avez accordé lors de notre entretien pour le poste de ${role} au sein de ${company}.`,
          `Merci pour cet entretien concernant le poste de ${role} chez ${company}, c'était très instructif.`,
          `Un grand merci pour ce moment d'échange autour du poste de ${role} chez ${company}, j'en garde un excellent souvenir.`
        ),
        "Cet échange a renforcé ma motivation à rejoindre votre équipe et à contribuer à vos projets dans le cadre de cette alternance.",
        personalInfo ? personalInfo : "",
        "",
        "Je reste à votre disposition pour toute information complémentaire et espère avoir prochainement le plaisir de collaborer avec vous.",
        "",
        "Cordialement,",
        signatureBlock,
      ]
        .filter(Boolean)
        .join("\n");
  }
}

function toneSentence(tone: MessageTone, professionnel: string, direct: string, chaleureux: string) {
  if (tone === "direct") return direct;
  if (tone === "chaleureux") return chaleureux;
  return professionnel;
}
