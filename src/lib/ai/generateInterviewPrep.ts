export interface GenerateInterviewPrepParams {
  company: string;
  role: string;
  jobDescription?: string;
  cvSummary?: string;
  firstName?: string;
  formation?: string;
}

export interface RevelationAnnonce {
  extrait: string;
  interpretation: string;
}

export interface PointDeVigilance {
  ecart: string;
  conseil: string;
}

export interface InterviewPrep {
  besoinsImplicites: RevelationAnnonce[];
  axeDifferenciant: string;
  syntheseAnnonce: string;
  pointsDeVigilance: PointDeVigilance[];
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
 *
 * Pour forcer cette interprétation à rester ancrée dans le texte réel (et éviter les
 * généralités du type « l'entreprise cherche quelqu'un de motivé et impliqué »), chaque
 * besoin implicite doit être adossé à un EXTRAIT LITTÉRAL de l'annonce (voir RevelationAnnonce).
 * Un candidat lisant le résultat doit pouvoir retrouver la phrase exacte dans l'annonce.
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
const BANNED_GENERIC_PHRASES = [
  "l'entreprise cherche quelqu'un de motivé et impliqué",
  "quelqu'un de motivé et impliqué",
  "vous devez être passionné(e)",
  "soyez vous-même",
  "montrez votre motivation",
  "ayez un bon relationnel",
  "esprit d'équipe",
  "capacité d'adaptation",
  "force de proposition",
  "autonomie et rigueur",
  "sens du contact",
];

const SYSTEM_PROMPT = `Tu aides des étudiants à se préparer à un entretien d'embauche pour une alternance. Ta valeur ajoutée, c'est de lire l'annonce comme un recruteur expérimenté la lirait, puis de croiser ça avec le profil réel du candidat — pas de reformuler l'une ni de flatter l'autre en surface.

AVANT de rédiger ta réponse, raisonne (dans ta tête, sans l'écrire) en 4 étapes :
1. Quel est le secteur précis, la taille et le stade probable de l'entreprise (petite structure / scale-up / grand groupe / cabinet...) d'après les indices RÉELS du texte (mots employés, taille d'équipe mentionnée, ton de l'annonce) — jamais inventé si aucun indice n'existe.
2. Quelles sont les 2-3 priorités business ou opérationnelles implicites de ce poste précis (pas génériques à "tous les postes en alternance").
3. Quels passages EXACTS de l'annonce (à citer mot pour mot) trahissent chacune de ces priorités.
4. En quoi le profil du candidat (CV, formation) colle ou ne colle pas complètement à ces priorités — un vrai croisement, pas une liste de qualités qui iraient pour n'importe qui.

Puis réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans balises markdown (pas de \`\`\`json), correspondant exactement à ce schéma :

{
  "besoinsImplicites": [
    {
      "extrait": "Citation LITTÉRALE et courte (5 à 15 mots) copiée mot pour mot depuis l'annonce fournie. Le candidat doit pouvoir la retrouver telle quelle dans l'annonce. Si aucune description d'offre n'est fournie, mets une chaîne vide.",
      "interpretation": "Ce que ce passage précis révèle vraiment sur le profil recherché, au-delà du sens littéral — jamais une généralité qui irait pour n'importe quel poste."
    }
    // 3 à 4 objets de ce type, chacun ancré sur un extrait DIFFÉRENT de l'annonce
  ],
  "axeDifferenciant": "LE point fort central que le candidat doit mettre en avant en premier pour CE poste précis — pas une qualité générique, mais le croisement le plus fort et le plus concret entre un élément SPÉCIFIQUE de son CV (nomme-le : une expérience, un projet, une compétence précise) et un besoin implicite identifié ci-dessus. Formule-le comme un conseil direct et actionnable (« Mets en avant... », « Ton expérience de... est exactement ce qu'ils cherchent car... »).",
  "syntheseAnnonce": "2 phrases maximum sur ce que couvre concrètement le poste au quotidien et sur le type de structure (d'après les indices réels du texte) — factuel, pas d'interprétation ici (elle est déjà dans besoinsImplicites).",
  "pointsDeVigilance": [
    {
      "ecart": "Un écart réel et probable entre ce que demande l'annonce et le profil du candidat tel que décrit dans son CV (ex : l'annonce demande une compétence, un outil ou une expérience que le CV ne mentionne pas clairement, ou mentionne trop peu). Sois honnête, ne minimise pas artificiellement.",
      "conseil": "Comment répondre à ça EN ENTRETIEN si la question arrive — jamais 'mentez' ou 'évitez le sujet', mais une vraie stratégie : rassurer via une expérience transférable, montrer une progression récente, poser une question qui retourne la situation, etc."
    }
    // 1 à 2 objets. Si le CV n'est pas fourni ou colle parfaitement (rare), donne quand même un point de vigilance plausible et générique à ce type de poste, jamais un tableau vide.
  ],
  "astuces": ["2 à 3 astuces de préparation CIBLÉES selon le type de métier du poste (détermine d'abord la famille : commercial, marketing/communication, technique/développement, RH, finance/gestion, support client...), formulées comme des conseils concrets et non génériques. Exemples de logique à appliquer : poste commercial → regarder les clients de référence et l'actualité commerciale de l'entreprise ; poste marketing/communication → regarder le ton et les réseaux sociaux de la marque, ses dernières campagnes ; poste technique → regarder la stack technique utilisée, le blog ingénierie ou le GitHub de l'entreprise ; poste RH → regarder la culture d'entreprise affichée et les avis d'anciens salariés. Adapte au poste réel, ne te limite pas à ces exemples, et ne dis jamais juste « regardez le site » sans préciser quoi y chercher précisément.",
  "pitch": "Un pitch de présentation personnelle à l'oral, 30 à 45 secondes, construit à partir du CV et du poste visé, qui intègre naturellement l'axe différenciant identifié plus haut",
  "pointsForts": ["3 points forts SUPPLÉMENTAIRES à l'axe différenciant (ne le répète pas), en lien avec les attentes de l'annonce, chacun rattaché à un élément concret du CV ou de la formation si disponible"],
  "questionsProbables": ["5 à 6 questions d'entretien probables, spécifiques au poste et à ce que décrit l'annonce — pas des questions génériques passe-partout. Inclure au moins une question probable qui découle directement d'un point de vigilance identifié plus haut."],
  "questionsARecruteur": ["3 questions intelligentes à poser au recruteur en fin d'entretien, en lien avec cette offre précise"]
}

Règles impératives :
- N'invente jamais de faits précis et vérifiables sur l'entreprise elle-même (chiffres, dates, actualités) que tu ne peux pas connaître avec certitude à partir de l'annonce fournie.
- En revanche, INTERPRÈTE librement et avec assurance ce que l'annonce révèle sur le profil recherché — c'est exactement ce qui est attendu de toi, ne reste pas en surface.
- Base-toi réellement sur le CV et l'annonce fournis : pas de conseils génériques qui iraient pour n'importe quel poste ou n'importe quel candidat.
- INTERDIT de produire une phrase qui ressemble à ces formulations creuses (ou équivalent) : ${BANNED_GENERIC_PHRASES.map((p) => `« ${p} »`).join(", ")}. Si une qualité comme "motivé" ou "autonome" est pertinente, elle doit toujours être rattachée à un élément concret et précis (un extrait de l'annonce, une expérience du CV), jamais affirmée seule.
- Chaque "extrait" doit être une citation réellement présente dans le texte de l'annonce fourni, pas une paraphrase. Si aucune annonce n'est fournie, laisse "extrait" vide et adapte "interpretation" en conséquence.
- Écris en français, dans un style direct et concret, jamais scolaire ni robotique.
- Le JSON doit être strictement valide (guillemets doubles, pas de virgule finale, pas de commentaire).`;

function buildPrompt(params: GenerateInterviewPrepParams): string {
  const { company, role, jobDescription, cvSummary, firstName, formation } = params;

  return [
    `Prépare un dossier d'entretien pour ${firstName || "un étudiant"}, qui passe un entretien pour le poste de ${role} chez ${company}.`,
    formation ? `Formation actuelle du candidat : ${formation}.` : "",
    jobDescription
      ? `Texte de l'annonce (base tes citations littérales UNIQUEMENT sur ce texte) :\n"""\n${jobDescription}\n"""`
      : "Aucune description d'offre fournie — base ton interprétation sur l'intitulé du poste et les attentes typiques de ce type de métier, laisse les champs 'extrait' vides, et signale-le implicitement par des formulations moins définitives.",
    cvSummary
      ? `Résumé du profil du candidat extrait de son CV :\n"""\n${cvSummary}\n"""`
      : "Aucun CV fourni — l'axe différenciant, le pitch et les points de vigilance doivent rester génériques mais toujours construits à partir des besoins implicites de l'annonce, pas de banalités.",
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
      // Relevé à 6000 (au lieu de 2800 à l'origine) : cause confirmée en production le
      // 16/08/2026 via les logs Vercel ("Unterminated string in JSON at position 9130") — la
      // réponse de Claude était coupée en plein JSON en heurtant la limite de 2800 tokens, sur
      // une préparation d'entretien avec annonce détaillée + CV à croiser (le cas le plus
      // riche, donc le plus consommateur). Le JSON attendu comporte 8-9 sections avec
      // plusieurs listes, et une réponse en français consomme davantage de tokens qu'en
      // anglais à longueur égale. 6000 laisse une marge large plutôt que juste suffisante,
      // pour éviter une récidive sur un cas encore plus riche (CV long + annonce longue).
      max_tokens: 6000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPrompt(params) }],
    }),
  });

  if (!response.ok) {
    // Diagnostic complet (statut + corps de la réponse) pour pouvoir identifier la vraie
    // cause dans les logs Vercel : clé invalide (401), quota/limite de débit dépassé (429),
    // requête mal formée (400), panne côté Anthropic (5xx)... plutôt qu'un simple "IA non
    // configurée" qui masque la vraie raison quand la clé EST bien configurée.
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Anthropic API error: ${response.status} — ${errorBody.slice(0, 500)}`);
  }

  const data = await response.json();
  const text = data?.content?.find((block: { type: string }) => block.type === "text")?.text;
  if (!text) throw new Error("Réponse Anthropic vide ou inattendue");

  // Filet de sécurité : au cas où l'IA ajouterait quand même des balises ```json
  // malgré la consigne, on les retire avant de parser.
  const withoutFences = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();

  // Deuxième filet de sécurité : si Claude a malgré tout ajouté une phrase avant ou après le
  // JSON (ex. un commentaire d'intro), on isole la portion entre la première "{" et la dernière
  // "}" plutôt que de faire échouer tout le parsing sur un texte qui n'est pas du JSON pur.
  const firstBrace = withoutFences.indexOf("{");
  const lastBrace = withoutFences.lastIndexOf("}");
  const jsonCandidate =
    firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
      ? withoutFences.slice(firstBrace, lastBrace + 1)
      : withoutFences;

  let parsed: any;
  try {
    parsed = JSON.parse(jsonCandidate);
  } catch (parseErr) {
    // Essentiel pour diagnostiquer une prochaine panne : sans ce log, on sait qu'un JSON.parse a
    // échoué mais pas DU TOUT ce que Claude a réellement répondu — impossible de distinguer une
    // réponse tronquée (max_tokens atteint), un format inattendu, ou autre chose.
    console.error(
      "JSON invalide renvoyé par Claude pour la préparation d'entretien — texte reçu :",
      withoutFences.slice(0, 1000)
    );
    throw parseErr;
  }

  const besoinsImplicites: RevelationAnnonce[] = Array.isArray(parsed.besoinsImplicites)
    ? parsed.besoinsImplicites
        .filter((item: unknown) => item && typeof item === "object")
        .map((item: { extrait?: string; interpretation?: string }) => ({
          extrait: item.extrait ?? "",
          interpretation: item.interpretation ?? "",
        }))
    : [];

  const pointsDeVigilance: PointDeVigilance[] = Array.isArray(parsed.pointsDeVigilance)
    ? parsed.pointsDeVigilance
        .filter((item: unknown) => item && typeof item === "object")
        .map((item: { ecart?: string; conseil?: string }) => ({
          ecart: item.ecart ?? "",
          conseil: item.conseil ?? "",
        }))
    : [];

  return {
    besoinsImplicites,
    axeDifferenciant: parsed.axeDifferenciant ?? "",
    syntheseAnnonce: parsed.syntheseAnnonce ?? "",
    pointsDeVigilance,
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
      {
        extrait: "",
        interpretation: `Sans annonce détaillée à disposition ici (mode de secours), misez sur ce qui est presque toujours implicite pour « ${role} chez ${company} » en alternance : la capacité à apprendre vite et à devenir autonome rapidement, même sans maîtriser tout le poste dès le départ.`,
      },
      {
        extrait: "",
        interpretation:
          "Un poste en alternance sous-entend presque toujours une vraie disponibilité et un engagement dans la durée (rythme d'alternance tenu, pas d'abandon en cours d'année) — soyez prêt(e) à le confirmer clairement.",
      },
    ],
    axeDifferenciant: `Mettez en avant l'expérience ou le projet de votre parcours qui montre le plus concrètement que vous savez apprendre vite et vous adapter à un nouvel environnement — c'est souvent ce qui pèse le plus pour un∙e recruteur∙se en alternance, avant même l'expérience exacte du poste.`,
    syntheseAnnonce: `Le poste de ${role} chez ${company} implique très probablement un vrai apprentissage sur le terrain, encadré par une équipe.`,
    pointsDeVigilance: [
      {
        ecart:
          "En mode de secours, impossible de comparer précisément votre CV aux exigences réelles de l'annonce — il peut donc y avoir un écart sur une compétence ou un outil précis attendu que vous ne maîtrisez pas encore.",
        conseil:
          "Préparez une réponse honnête type : nommez la limite, puis enchaînez immédiatement sur une preuve concrète de votre capacité à apprendre vite (exemple chiffré ou situation vécue).",
      },
    ],
    astuces: [
      `Allez sur le site de ${company} et identifiez 2-3 clients ou projets phares que vous pourrez citer.`,
      `Regardez leurs réseaux sociaux (LinkedIn en priorité) pour repérer le ton de l'entreprise et ses actualités récentes.`,
      "Préparez un exemple concret et chiffré d'une situation où vous avez dû apprendre vite.",
    ],
    pitch: `Bonjour, je m'appelle ${firstName || "..."}. Je recherche actuellement une alternance en ${role}, et votre offre chez ${company} correspond exactement à ce que je cherche à développer. J'ai hâte de vous en dire plus sur mon parcours et sur ce que je peux apporter à votre équipe.`,
    pointsForts: [
      "Une expérience ou un projet concret en lien avec le poste, à détailler avec un exemple chiffré si possible.",
      "Votre disponibilité et votre rythme d'alternance, à confirmer clairement.",
      "Un exemple précis de situation où vous avez pris une initiative sans qu'on vous le demande.",
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
