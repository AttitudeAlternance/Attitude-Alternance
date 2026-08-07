export interface GenerateInterviewPrepParams {
  company: string;
  role: string;
  jobDescription?: string;
  cvSummary?: string;
  firstName?: string;
  formation?: string;
}

export interface InterviewPrep {
  besoinsImplicites: string[];
  axeDifferenciant: string;
  syntheseAnnonce: string;
  astuces: string[];
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
 * (pas de recherche web). L'objectif ici n'est donc pas de fournir des faits "vérifiés"
 * sur l'entreprise, mais de vraiment interpréter le texte de l'annonce — repérer ce
 * qu'elle demande sans le dire explicitement — plutôt que de se contenter de la
 * reformuler, ce qui n'apporterait aucune valeur par rapport à une simple relecture.
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
const SYSTEM_PROMPT = `Tu aides des étudiants à se préparer à un entretien d'embauche pour une alternance. Ta valeur ajoutée, c'est de lire l'annonce comme un recruteur expérimenté la lirait — pas de la reformuler.

Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans balises markdown (pas de \`\`\`json), correspondant exactement à ce schéma :

{
  "besoinsImplicites": ["2 à 3 éléments que l'annonce demande SANS le dire explicitement. Chaque élément doit suivre le format : « [passage ou idée clé de l'annonce] » → [ce que ça révèle vraiment sur le profil recherché]. Exemples de raisonnement à appliquer : un poste commercial qui mentionne des cycles de vente longs ou des comptes grands groupes révèle un besoin d'expérience en B2B, pas juste en vente ; une mention d'« environnement exigeant », « rythme soutenu » ou « forte autonomie » révèle un besoin de résilience et de gestion du stress ; une mention de « plusieurs projets en parallèle » révèle un besoin d'organisation et de priorisation ; un poste dans une petite structure/startup révèle un besoin de polyvalence et d'initiative, pas seulement de compétence technique. Applique ce type de raisonnement au cas précis, ne te limite pas à ces exemples.",
  "axeDifferenciant": "LE point fort central que le candidat doit mettre en avant en premier pour CE poste précis — pas une qualité générique, mais le croisement le plus fort et le plus concret entre son CV et les besoins implicites identifiés ci-dessus. Formule-le comme un conseil direct et actionnable (« Mets en avant... », « Ton expérience de... est exactement ce qu'ils cherchent car... »), avec la justification concrète tirée du CV.",
  "syntheseAnnonce": "2 phrases maximum sur ce que couvre concrètement le poste au quotidien — factuel, pas d'interprétation ici (elle est déjà dans besoinsImplicites).",
  "astuces": ["2 à 3 astuces de préparation CIBLÉES selon le type de métier du poste (détermine d'abord la famille : commercial, marketing/communication, technique/développement, RH, finance/gestion, support client...), formulées comme des conseils concrets et non génériques. Exemples de logique à appliquer : poste commercial → regarder les clients de référence et l'actualité commerciale de l'entreprise ; poste marketing/communication → regarder le ton et les réseaux sociaux de la marque, ses dernières campagnes ; poste technique → regarder la stack technique utilisée, le blog ingénierie ou le GitHub de l'entreprise ; poste RH → regarder la culture d'entreprise affichée et les avis d'anciens salariés. Adapte au poste réel, ne te limite pas à ces exemples, et ne dis jamais juste « regardez le site » sans préciser quoi y chercher précisément.",
  "pitch": "Un pitch de présentation personnelle à l'oral, 30 à 45 secondes, construit à partir du CV et du poste visé, qui intègre naturellement l'axe différenciant identifié plus haut",
  "pointsForts": ["3 points forts SUPPLÉMENTAIRES à l'axe différenciant (ne le répète pas), en lien avec les attentes de l'annonce"],
  "questionsProbables": ["5 à 6 questions d'entretien probables, spécifiques au poste et à ce que décrit l'annonce — pas des questions génériques passe-partout"],
  "questionsARecruteur": ["3 questions intelligentes à poser au recruteur en fin d'entretien, en lien avec cette offre précise"]
}

Règles impératives :
- N'invente jamais de faits précis et vérifiables sur l'entreprise elle-même (chiffres, dates, actualités) que tu ne peux pas connaître avec certitude à partir de l'annonce fournie.
- En revanche, INTERPRÈTE librement et avec assurance ce que l'annonce révèle sur le profil recherché — c'est exactement ce qui est attendu de toi, ne reste pas en surface.
- Base-toi réellement sur le CV et l'annonce fournis : pas de conseils génériques qui iraient pour n'importe quel poste ou n'importe quel candidat.
- Écris en français, dans un style direct et concret, jamais scolaire ni robotique.
- Le JSON doit être strictement valide (guillemets doubles, pas de virgule finale, pas de commentaire).`;

function buildPrompt(params: GenerateInterviewPrepParams): string {
  const { company, role, jobDescription, cvSummary, firstName, formation } = params;

  return [
    `Prépare un dossier d'entretien pour ${firstName || "un étudiant"}, qui passe un entretien pour le poste de ${role} chez ${company}.`,
    formation ? `Formation actuelle du candidat : ${formation}.` : "",
    jobDescription
      ? `Texte de l'annonce :\n"""\n${jobDescription}\n"""`
      : "Aucune description d'offre fournie — base ton interprétation sur l'intitulé du poste et les attentes typiques de ce type de métier, en le signalant implicitement par des formulations moins définitives.",
    cvSummary
      ? `Résumé du profil du candidat extrait de son CV :\n"""\n${cvSummary}\n"""`
      : "Aucun CV fourni — l'axe différenciant et le pitch doivent rester génériques mais toujours construits à partir des besoins implicites de l'annonce, pas de banalités.",
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
    besoinsImplicites: Array.isArray(parsed.besoinsImplicites) ? parsed.besoinsImplicites : [],
    axeDifferenciant: parsed.axeDifferenciant ?? "",
    syntheseAnnonce: parsed.syntheseAnnonce ?? "",
    astuces: Array.isArray(parsed.astuces) ? parsed.astuces : [],
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
    besoinsImplicites: [
      `« ${role} chez ${company} » → sans plus de détails, misez sur ce qui est toujours implicite en alternance : la capacité à apprendre vite et à être autonome rapidement, même sans expérience complète du poste.`,
      "Un poste en alternance sous-entend presque toujours une vraie disponibilité et un engagement dans la durée — soyez prêt(e) à le confirmer clairement.",
    ],
    axeDifferenciant: `Mettez en avant ce qui, dans votre parcours, montre concrètement que vous savez apprendre vite et vous adapter — c'est souvent ce qui compte le plus pour un∙e recruteur∙se en alternance, plus que l'expérience exacte du poste.`,
    syntheseAnnonce: `Le poste de ${role} chez ${company} implique très probablement un vrai apprentissage sur le terrain, encadré par une équipe.`,
    astuces: [
      `Allez sur le site de ${company} et identifiez 2-3 clients ou projets phares que vous pourrez citer.`,
      `Regardez leurs réseaux sociaux (LinkedIn en priorité) pour repérer le ton de l'entreprise et ses actualités récentes.`,
      "Préparez un exemple concret et chiffré d'une situation où vous avez dû apprendre vite.",
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
