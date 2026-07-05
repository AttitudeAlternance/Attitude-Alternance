import { detectSchoolOffer as detectSchoolOfferHeuristic } from "@/lib/detectSchoolOffer";

export interface SchoolOfferAiResult {
  percentage: number; // 0 à 100
  reasons: string[];
  usedRealAi: boolean;
}

const SYSTEM_PROMPT = `Tu es un expert du marché de l'alternance en France, spécialisé dans le repérage des fausses offres publiées par des écoles ou organismes de formation à des fins de captation de candidats (l'objectif réel est de faire remplir un dossier d'admission à une formation, pas de pourvoir un poste précis chez un employeur identifié).

Analyse le texte fourni et détermine s'il s'agit :
- d'une VRAIE offre d'entreprise (poste précis, entreprise identifiable, missions concrètes) → score bas
- d'une offre-leurre publiée par une école/organisme de formation (met en avant la formation, un coach, un accompagnement, une "entreprise partenaire" non identifiée, des arguments sur les frais de scolarité, le diplôme obtenu, l'admission...) → score élevé

Indices typiques d'une offre-leurre : mention d'un CFA, d'une école, d'un organisme de formation à distance, d'un accompagnement/coach dédié, d'une "entreprise partenaire" non nommée, de frais de scolarité ou de leur absence, de niveaux de diplômes (CAP, BTS, Bachelor, Mastère), de rentrée scolaire, de conseillers admission, ou toute tournure qui vend davantage une formation qu'un poste précis chez un employeur clairement identifié.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, sans balises markdown, au format exact :
{"percentage": <entier de 0 à 100>, "reasons": ["raison concrète 1", "raison concrète 2", "raison concrète 3"]}

"reasons" doit citer 2 à 5 éléments concrets et courts tirés du texte (pas de généralités), en français.`;

export async function detectSchoolOfferWithAi(text: string, offerUrl?: string | null): Promise<SchoolOfferAiResult> {
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
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                offerUrl ? `Lien de l'offre : ${offerUrl}` : "",
                `Texte de l'offre :\n"""\n${text}\n"""`,
              ]
                .filter(Boolean)
                .join("\n\n"),
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.content?.find((b: { type: string }) => b.type === "text")?.text;
        if (rawText) {
          const cleaned = rawText.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(cleaned);
          if (typeof parsed.percentage === "number") {
            return {
              percentage: Math.max(0, Math.min(100, Math.round(parsed.percentage))),
              reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 5) : [],
              usedRealAi: true,
            };
          }
        }
      }
    } catch (err) {
      console.error("Erreur détection offre-école via Anthropic, repli sur l'heuristique :", err);
    }
  }

  // Repli sans IA : heuristique basée sur des mots-clés (moins fiable, mais fonctionne sans clé configurée)
  const heuristic = detectSchoolOfferHeuristic(text, offerUrl);
  return {
    percentage: heuristic.percentage,
    reasons: heuristic.matchedSignals,
    usedRealAi: false,
  };
}
