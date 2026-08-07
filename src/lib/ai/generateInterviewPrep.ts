export interface GenerateInterviewPrepParams {
  company: string;
  role: string;
  jobDescription?: string;
  cvSummary?: string;
  firstName?: string;
  formation?: string;
}

export interface InterviewPrep {
  syntheseAnnonce: string;
  aVerifier: string[];
  pitch: string;
  pointsForts: string[];
  questionsProbables: string[];
  questionsARecruteur: string[];
}

export interface GenerateInterviewPrepResult {
  prep: InterviewPrep;
  usedRealAi: boolean;
}

/**
 * Point d'entrée unique pour la génération d'une préparation d'entretien.
 *
 * Comme pour generateMessage, une vraie IA (Claude) est utilisée si ANTHROPIC_API_KEY
 * est configurée ; sinon un générateur local plus basique prend le relais.
 *
 * Important : l'IA n'a pas accès à des données réelles et à jour sur l'entreprise
 * (pas de recherche web). Elle synthétise donc ce qui est écrit dans l'annonce, et
 * oriente explicitement l'étudiant à vérifier lui-même le reste (site, actualités) —
 * plutôt que d'inventer des faits qui semblent précis mais ne le sont pas.
 */
export async function generateInterviewPrep(
  params: GenerateInterviewPrepParams
): Promise<GenerateInterviewPrepResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const prep = await generateWithClaude(params, apiKey);
      return { prep, usedRealAi: true };
    } catch (err) {
      console.error("Erreur lors de l'appel à l'API Anthropic, repli sur le générateur local :", err);
      return { prep: generatePlaceholderPrep(params), usedRealAi: false };
    }
  }

  return { prep: generatePlaceholderPrep(params), usedRealAi: false };
}

// ----------------------------------------------------------------------------
// Génération réelle via l'API Anthropic (Claude)
// ----------------------------------------------------------------------------
const SYSTEM_PROMPT = `Tu aides des étudiants à se préparer à un entretien d'embauche pour une alternance.

Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans balises markdown (pas de \`\`\`json), correspondant exactement à ce schéma :

{
  "syntheseAnnonce": "2 à 3 phrases résumant ce que l'entreprise recherche vraiment, basé uniquement sur le texte de l'annonce fourni",
  "aVerifier": ["3 éléments précis et concrets que l'étudiant doit aller vérifier lui-même avant l'entretien (site web de l'entreprise, actualités récentes, réseaux sociaux...)"],
  "pitch": "Un pitch de présentation personnelle à l'oral, 30 à 45 secondes, construit à partir du CV et du poste visé",
  "pointsForts": ["3 à 4 points forts du candidat à mettre en avant, en lien direct avec les attentes de l'annonce"],
  "questionsProbables": ["5 à 6 questions d'entretien probables, spécifiques au poste et à ce que décrit l'annonce — pas des questions génériques passe-partout"],
  "questionsARecruteur": ["3 questions intelligentes à poser au recruteur en fin d'entretien, en lien avec cette offre précise"]
}

Règles impératives :
- N'invente jamais de faits précis et vérifiables sur l'entreprise (chiffres, dates, actualités) que tu ne peux pas connaître avec certitude à partir de l'annonce fournie — pour tout le reste, oriente l'étudiant à vérifier lui-même via "aVerifier".
- Base-toi réellement sur le CV et l'annonce fournis : pas de conseils génériques qui iraient pour n'importe quel poste.
- Écris en français, dans un style direct et concret, jamais scolaire ni robotique.
- Le JSON doit être strictement valide (guillemets doubles, pas de virgule finale, pas de commentaire).`;

function buildPrompt(params: GenerateInterviewPrepParams): string {
  const { company, role, jobDescription, cvSummary, firstName, formation } = params;

  return [
    `Prépare un dossier d'entretien pour ${firstName || "un étudiant"}, qui passe un entretien pour le poste de ${role} chez ${company}.`,
    formation ? `Formation actuelle du candidat : ${formation}.` : "",
    jobDescription
      ? `Texte de l'annonce :\n"""\n${jobDescription}\n"""`
      : "Aucune description d'offre fournie — reste plus générique sur la synthèse de l'annonce et les questions probables, en te basant sur l'intitulé du poste.",
    cvSummary
      ? `Résumé du profil du candidat extrait de son CV :\n"""\n${cvSummary}\n"""`
      : "Aucun CV fourni — construis un pitch et des points forts plus génériques, adaptés au poste visé.",
  ]
    .filter(Boolean)
    .join("\n");
}

async function generateWithClaude(params: GenerateInterviewPrepParams, apiKey: string): Promise<InterviewPrep> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1400,
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

  // Filet de sécurité : au cas où l'IA ajouterait quand même des balises ```json
  // malgré la consigne, on les retire avant de parser.
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    syntheseAnnonce: parsed.syntheseAnnonce ?? "",
    aVerifier: Array.isArray(parsed.aVerifier) ? parsed.aVerifier : [],
    pitch: parsed.pitch ?? "",
    pointsForts: Array.isArray(parsed.pointsForts) ? parsed.pointsForts : [],
    questionsProbables: Array.isArray(parsed.questionsProbables) ? parsed.questionsProbables : [],
    questionsARecruteur: Array.isArray(parsed.questionsARecruteur) ? parsed.questionsARecruteur : [],
  };
}

// ----------------------------------------------------------------------------
// Générateur local (repli, sans clé API)
// ----------------------------------------------------------------------------
function generatePlaceholderPrep(params: GenerateInterviewPrepParams): InterviewPrep {
  const { company, role, firstName } = params;

  return {
    syntheseAnnonce: `L'entreprise ${company} recherche un profil pour le poste de ${role}, avec l'envie de trouver quelqu'un de motivé et capable de monter en compétences rapidement en alternance.`,
    aVerifier: [
      `Le site web de ${company} : activité, valeurs, actualités récentes.`,
      `La page LinkedIn de ${company} : publications récentes, taille de l'équipe.`,
      `Le nom de la personne qui vous reçoit, si vous l'avez, pour personnaliser vos échanges.`,
    ],
    pitch: `Bonjour, je m'appelle ${firstName || "..."}. Je recherche actuellement une alternance en ${role}, et votre offre chez ${company} correspond exactement à ce que je cherche à développer. J'ai hâte de vous en dire plus sur mon parcours et sur ce que je peux apporter à votre équipe.`,
    pointsForts: [
      "Votre motivation et votre capacité à apprendre vite.",
      "Une expérience ou un projet concret en lien avec le poste, à détailler avec un exemple chiffré si possible.",
      "Votre disponibilité et votre rythme d'alternance, à confirmer clairement.",
    ],
    questionsProbables: [
      "Pourquoi souhaitez-vous rejoindre notre entreprise ?",
      "Parlez-moi d'un projet dont vous êtes fier(ère).",
      "Comment gérez-vous les moments où vous ne savez pas faire quelque chose ?",
      "Quelles sont vos disponibilités et votre rythme d'alternance ?",
      "Où vous voyez-vous dans deux ans ?",
    ],
    questionsARecruteur: [
      "Comment se déroule concrètement l'intégration d'un(e) alternant(e) dans l'équipe ?",
      "Quels sont les objectifs attendus sur les premiers mois ?",
      "Qui serait mon/ma tuteur/tutrice au quotidien ?",
    ],
  };
}
