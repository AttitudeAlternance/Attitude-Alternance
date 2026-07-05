export interface SchoolOfferDetectionResult {
  percentage: number; // 0 à 100 : probabilité estimée que ce soit une offre-leurre d'école
  isSuspicious: boolean;
  confidence: "faible" | "moyenne" | "élevée";
  matchedSignals: string[];
}

// Tournures caractéristiques des annonces publiées par des écoles/organismes de formation pour
// capter des leads (l'offre sert en réalité à faire remplir un formulaire d'admission, ou recrute
// pour une "entreprise partenaire" non identifiée), plutôt que de vraies offres d'entreprise.
// Liste non exhaustive, construite pour repérer les cas les plus courants.
const SIGNAL_PHRASES: { pattern: RegExp; label: string }[] = [
  { pattern: /journée[s]?\s+portes?\s+ouvertes?|\bjpo\b/i, label: "mention d'une journée portes ouvertes" },
  { pattern: /notre\s+(école|campus|établissement)/i, label: "référence à « notre école / campus »" },
  { pattern: /nos\s+campus/i, label: "référence à « nos campus »" },
  { pattern: /titre\s+(certifié|rncp)|reconnu(e|es|s)?\s+par\s+l['’]état/i, label: "mention d'un titre certifié / RNCP / reconnu par l'État" },
  { pattern: /formations?\s+diplômantes?/i, label: "mention de « formation(s) diplômante(s) »" },
  { pattern: /frais\s+de\s+scolarité/i, label: "mention de frais de scolarité" },
  { pattern: /dossier\s+de\s+candidature.{0,30}(formation|école)/i, label: "dossier de candidature à une formation" },
  { pattern: /rentrée\s+(de\s+)?(septembre|janvier|octobre)/i, label: "mention d'une date de rentrée scolaire" },
  { pattern: /conseiller[s]?\s+(en\s+)?admission/i, label: "mention d'un conseiller en admissions" },
  { pattern: /que\s+vous\s+soyez\s+(actuellement\s+)?en\s+(terminale|bac)/i, label: "ciblage de lycéens/bacheliers" },
  { pattern: /réseau\s+de\s+plus\s+de\s+\d+\s+entreprises?\s+partenaires?/i, label: "mise en avant d'un réseau d'entreprises partenaires" },
  { pattern: /(pour|chez)\s+(son|notre|une)\s+entreprise\s+partenaire/i, label: "recrutement pour une « entreprise partenaire » non nommée" },
  { pattern: /trouv(ez|er)\s+votre\s+alternance\s+grâce\s+à/i, label: "promesse de trouver une alternance « grâce à » l'organisme" },
  { pattern: /alternance\s+nouvelle\s+génération/i, label: "slogan marketing type « alternance nouvelle génération »" },
  { pattern: /candidat(ez|er)\s+à\s+notre\s+(école|formation|programme)/i, label: "invitation à candidater à une formation" },
  { pattern: /admissions?\s+ouvertes?/i, label: "mention d'admissions ouvertes" },
  { pattern: /bachelor|mastère|\bmba\b/i, label: "mention d'un diplôme (Bachelor/Mastère/MBA)" },
  { pattern: /niveau\s+\d\s+à\s+niveau\s+\d|bac\+\d.{0,15}(bachelor|mastère|bac\+\d)/i, label: "présentation par niveaux de diplôme (Bac+2 à Bac+5...)" },
];

// Organismes de formation connus en France pour publier ce type d'annonces génériques
// (recrutement pour une "entreprise partenaire" au profit de leur propre programme de formation).
// Liste non exhaustive et amenée à évoluer — la présence d'un nom ne prouve rien en soi,
// mais constitue un signal fort quand elle apparaît dans le texte de l'offre.
const KNOWN_TRAINING_ORGANIZATIONS = [
  "iscod",
  "studi",
  "walter learning",
  "digital campus",
  "ipac bachelor factory",
  "ipac",
  "mbway",
  "groupe igs",
  "efap",
  "esgci",
  "inseec",
  "iseg",
  "idrac",
  "icd business school",
  "istec",
  "esam",
  "esgcv",
  "efficom",
  "esup",
  "itic paris",
  "ecema",
  "iseam",
  "esarc",
  "sup de vente",
  "escen",
  "ifag",
  "egc",
  "iscpa",
  "sup'career",
  "eductive",
  "galileo global education",
];

// Fragments de nom de domaine fréquemment utilisés par des sites d'écoles/organismes de formation
// (signal secondaire, complémentaire à l'analyse du texte — jamais suffisant à lui seul).
const SCHOOL_DOMAIN_HINTS = ["ecole", "campus", "formation", "business-school", "institut", "groupe-igs", "ionis"];

export function detectSchoolOffer(text: string, offerUrl?: string | null): SchoolOfferDetectionResult {
  const matchedSignals: string[] = [];

  for (const { pattern, label } of SIGNAL_PHRASES) {
    if (pattern.test(text)) matchedSignals.push(label);
  }

  const lowerText = text.toLowerCase();
  const matchedBrand = KNOWN_TRAINING_ORGANIZATIONS.find((brand) => lowerText.includes(brand));
  if (matchedBrand) {
    matchedSignals.push(`nom d'un organisme connu pour ce type d'annonces (« ${matchedBrand.toUpperCase()} »)`);
  }

  if (offerUrl) {
    try {
      const hostname = new URL(offerUrl).hostname.toLowerCase();
      if (SCHOOL_DOMAIN_HINTS.some((hint) => hostname.includes(hint))) {
        matchedSignals.push("nom de domaine évoquant un organisme de formation");
      }
    } catch {
      // URL invalide : on ignore simplement ce signal
    }
  }

  let percentage = Math.min(100, matchedSignals.length * 20);
  // La présence d'un nom d'organisme connu est un signal fort à elle seule :
  // elle garantit un risque au moins "élevé", même sans autre signal détecté.
  if (matchedBrand) {
    percentage = Math.max(percentage, 70);
  }

  const isSuspicious = percentage >= 40;
  const confidence: SchoolOfferDetectionResult["confidence"] = percentage >= 70 ? "élevée" : percentage >= 40 ? "moyenne" : "faible";

  return { percentage, isSuspicious, confidence, matchedSignals };
}
