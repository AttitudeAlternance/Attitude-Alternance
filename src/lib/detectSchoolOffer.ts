export interface SchoolOfferDetectionResult {
  percentage: number; // 0 à 100 : probabilité estimée que ce soit une offre-leurre d'école
  isSuspicious: boolean;
  confidence: "faible" | "moyenne" | "élevée";
  matchedSignals: string[];
}

// Tournures caractéristiques des annonces publiées par des écoles pour capter des leads
// (l'offre sert en réalité à faire remplir un formulaire d'admission), plutôt que de vraies
// offres d'entreprise. Liste non exhaustive, construite pour repérer les cas les plus courants.
const SIGNAL_PHRASES: { pattern: RegExp; label: string }[] = [
  { pattern: /journée[s]?\s+portes?\s+ouvertes?|\bjpo\b/i, label: "mention d'une journée portes ouvertes" },
  { pattern: /notre\s+(école|campus|établissement)/i, label: "référence à « notre école / campus »" },
  { pattern: /nos\s+campus/i, label: "référence à « nos campus »" },
  { pattern: /titre\s+(certifié|rncp)|reconnu[e]?\s+par\s+l['’]état/i, label: "mention d'un titre certifié / RNCP" },
  { pattern: /frais\s+de\s+scolarité/i, label: "mention de frais de scolarité" },
  { pattern: /dossier\s+de\s+candidature.{0,30}(formation|école)/i, label: "dossier de candidature à une formation" },
  { pattern: /rentrée\s+(de\s+)?(septembre|janvier|octobre)/i, label: "mention d'une date de rentrée scolaire" },
  { pattern: /conseiller[s]?\s+(en\s+)?admission/i, label: "mention d'un conseiller en admissions" },
  { pattern: /que\s+vous\s+soyez\s+(actuellement\s+)?en\s+(terminale|bac)/i, label: "ciblage de lycéens/bacheliers" },
  { pattern: /réseau\s+de\s+plus\s+de\s+\d+\s+entreprises?\s+partenaires?/i, label: "mise en avant d'un réseau d'entreprises partenaires" },
  { pattern: /trouv(ez|er)\s+votre\s+alternance\s+grâce\s+à/i, label: "promesse de trouver une alternance « grâce à » l'organisme" },
  { pattern: /candidat(ez|er)\s+à\s+notre\s+(école|formation|programme)/i, label: "invitation à candidater à une formation" },
  { pattern: /admissions?\s+ouvertes?/i, label: "mention d'admissions ouvertes" },
  { pattern: /bachelor|mastère|mba(?!\s+en\s+entreprise)/i, label: "mention d'un diplôme (Bachelor/Mastère/MBA)" },
];

// Fragments de nom de domaine fréquemment utilisés par des sites d'écoles/organismes de formation
// (signal secondaire, complémentaire à l'analyse du texte — jamais suffisant à lui seul).
const SCHOOL_DOMAIN_HINTS = ["ecole", "campus", "formation", "business-school", "institut", "groupe-igs", "ionis"];

export function detectSchoolOffer(text: string, offerUrl?: string | null): SchoolOfferDetectionResult {
  const matchedSignals: string[] = [];

  for (const { pattern, label } of SIGNAL_PHRASES) {
    if (pattern.test(text)) matchedSignals.push(label);
  }

  let domainFlag = false;
  if (offerUrl) {
    try {
      const hostname = new URL(offerUrl).hostname.toLowerCase();
      domainFlag = SCHOOL_DOMAIN_HINTS.some((hint) => hostname.includes(hint));
      if (domainFlag) matchedSignals.push("nom de domaine évoquant un organisme de formation");
    } catch {
      // URL invalide : on ignore simplement ce signal
    }
  }

  const signalCount = matchedSignals.length;
  const percentage = Math.min(100, signalCount * 20);
  const isSuspicious = signalCount >= 2;
  const confidence: SchoolOfferDetectionResult["confidence"] = signalCount >= 4 ? "élevée" : signalCount >= 2 ? "moyenne" : "faible";

  return { percentage, isSuspicious, confidence, matchedSignals };
}
