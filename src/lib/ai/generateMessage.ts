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
}

/**
 * Point d'entrée unique pour la génération de messages.
 *
 * Pour connecter une vraie API (OpenAI, Anthropic...) :
 * 1. Ajoutez votre clé dans .env.local (OPENAI_API_KEY ou ANTHROPIC_API_KEY)
 * 2. Remplacez le contenu de cette fonction par un appel à l'API souhaitée
 *    (voir les exemples commentés en bas de fichier)
 * 3. Gardez la même signature (GenerateMessageParams -> Promise<string>)
 *    pour ne rien changer côté interface.
 */
export async function generateMessage(params: GenerateMessageParams): Promise<string> {
  const hasRealApiKey = Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);

  if (!hasRealApiKey) {
    return generatePlaceholderMessage(params);
  }

  // --- Zone à activer quand une clé API est configurée ---
  // Exemple avec l'API Anthropic (à décommenter et adapter) :
  //
  // const response = await fetch("https://api.anthropic.com/v1/messages", {
  //   method: "POST",
  //   headers: {
  //     "content-type": "application/json",
  //     "x-api-key": process.env.ANTHROPIC_API_KEY!,
  //     "anthropic-version": "2023-06-01",
  //   },
  //   body: JSON.stringify({
  //     model: "claude-sonnet-4-6",
  //     max_tokens: 600,
  //     messages: [{ role: "user", content: buildPrompt(params) }],
  //   }),
  // });
  // const data = await response.json();
  // return data.content[0].text;

  // Repli de sécurité si l'appel réel n'est pas encore branché :
  return generatePlaceholderMessage(params);
}

// Construit le prompt qui sera envoyé à une vraie API IA (utile une fois branché)
export function buildPrompt(params: GenerateMessageParams): string {
  const { type, company, role, recruiterName, tone, personalInfo, firstName, lastName } = params;
  return [
    `Rédige un ${labelForType(type)} pour un étudiant qui recherche une alternance.`,
    `Entreprise ciblée : ${company}`,
    `Poste visé : ${role}`,
    recruiterName ? `Recruteur : ${recruiterName}` : "",
    `Ton souhaité : ${tone}`,
    `Signataire : ${[firstName, lastName].filter(Boolean).join(" ") || "L'étudiant"}`,
    personalInfo ? `Informations personnelles à intégrer : ${personalInfo}` : "",
    "Le texte doit être prêt à copier-coller, sans placeholder du type [xxx].",
  ]
    .filter(Boolean)
    .join("\n");
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
// Générateur local (placeholder). Produit un texte cohérent et personnalisé
// sans dépendance externe, pour que la fonctionnalité soit utilisable
// immédiatement, même sans clé API configurée.
// ----------------------------------------------------------------------------
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
  } = params;

  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Prénom Nom";
  const greetingName = recruiterName ? recruiterName : "Madame, Monsieur";
  const politeOpen = tone === "chaleureux" ? `Bonjour ${greetingName},` : `Bonjour${recruiterName ? ` ${recruiterName}` : ""},`;
  const signatureBlock = [fullName, formation ? formation : ""].filter(Boolean).join("\n");

  switch (type) {
    case "candidature":
      return [
        politeOpen,
        "",
        toneSentence(
          tone,
          `Je me permets de vous contacter concernant une opportunité d'alternance en tant que ${role} au sein de ${company}.`,
          `Je vous écris pour candidater directement au poste de ${role} chez ${company}, qui correspond exactement à ce que je recherche.`,
          `C'est avec grand enthousiasme que je me tourne vers ${company} pour vous proposer ma candidature au poste de ${role} en alternance.`
        ),
        formation
          ? `Actuellement en ${formation}, je recherche une alternance me permettant de mettre en pratique mes compétences tout en continuant à apprendre sur le terrain.`
          : `Je recherche actuellement une alternance me permettant de mettre en pratique mes compétences tout en continuant à me former.`,
        personalInfo ? personalInfo : "Je serais ravi(e) de vous présenter mon parcours et ma motivation lors d'un entretien.",
        "",
        "Je reste disponible pour échanger à votre convenance et vous remercie par avance pour l'attention portée à ma candidature.",
        "",
        "Cordialement,",
        signatureBlock,
      ].join("\n");

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
