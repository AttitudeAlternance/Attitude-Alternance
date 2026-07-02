export interface MatchScoreResult {
  score: number; // 0 à 100
  strengths: string[];
  gaps: string[];
  usedRealAi: boolean;
}

/**
 * Calcule un score de correspondance entre le profil de l'étudiant (résumé de CV)
 * et une offre d'alternance (description de poste).
 *
 * Avec ANTHROPIC_API_KEY configurée : analyse réelle par Claude (score + points forts + manques).
 * Sans clé : estimation locale basée sur le recouvrement de mots-clés entre les deux textes.
 */
export async function computeMatchScore(params: {
  cvSummary: string;
  jobDescription: string;
}): Promise<MatchScoreResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 500,
          system:
            "Tu évalues la correspondance entre le profil d'un étudiant (résumé de CV) et une offre d'alternance. " +
            "Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, sans balises markdown, au format exact : " +
            '{"score": <nombre entier de 0 à 100>, "strengths": ["point fort 1", "point fort 2", "point fort 3"], "gaps": ["élément manquant ou à renforcer 1", "élément 2"]}. ' +
            "Les points forts et manques doivent être courts (une phrase max), concrets et rédigés en français.",
          messages: [
            {
              role: "user",
              content: `Résumé du CV :\n"""\n${params.cvSummary}\n"""\n\nDescription de l'offre :\n"""\n${params.jobDescription}\n"""`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.content?.find((b: { type: string }) => b.type === "text")?.text;
        if (text) {
          const cleaned = text.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(cleaned);
          if (typeof parsed.score === "number") {
            return {
              score: Math.max(0, Math.min(100, Math.round(parsed.score))),
              strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 4) : [],
              gaps: Array.isArray(parsed.gaps) ? parsed.gaps.slice(0, 4) : [],
              usedRealAi: true,
            };
          }
        }
      }
    } catch (err) {
      console.error("Erreur score de correspondance via Anthropic, repli sur l'estimation locale :", err);
    }
  }

  return { ...computeLocalMatchScore(params.cvSummary, params.jobDescription), usedRealAi: false };
}

const STOPWORDS = new Set([
  "le", "la", "les", "de", "des", "du", "un", "une", "et", "en", "à", "au", "aux", "pour", "dans", "sur",
  "avec", "par", "est", "sont", "ce", "cette", "ces", "vous", "nous", "votre", "notre", "qui", "que", "vos",
  "plus", "être", "avoir", "ou", "son", "ses", "sa", "il", "elle", "ils", "elles", "leur", "leurs", "tout",
  "toute", "tous", "toutes", "afin", "ainsi", "sous", "chez", "mais", "donc", "car",
]);

// Repli sans IA : estimation grossière basée sur le pourcentage de mots-clés de l'offre
// retrouvés dans le résumé du CV. Volontairement simple et transparent sur ses limites.
function computeLocalMatchScore(cvSummary: string, jobDescription: string): Omit<MatchScoreResult, "usedRealAi"> {
  const extractWords = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w));

  const jobWords = Array.from(new Set(extractWords(jobDescription)));
  const cvWords = new Set(extractWords(cvSummary));

  if (jobWords.length === 0) {
    return { score: 0, strengths: [], gaps: [] };
  }

  const matched = jobWords.filter((w) => cvWords.has(w));
  const score = Math.round((matched.length / jobWords.length) * 100);

  return {
    score,
    strengths: matched.slice(0, 5),
    gaps: jobWords.filter((w) => !cvWords.has(w)).slice(0, 5),
  };
}
