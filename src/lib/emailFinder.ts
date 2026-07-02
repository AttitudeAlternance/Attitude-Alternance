export interface EmailGuess {
  email: string;
  confidence: "verifiee" | "estimee";
}

export interface FindEmailParams {
  domain: string;
  firstName: string;
  lastName: string;
}

// Nettoie un nom de domaine saisi par l'utilisateur (accepte une URL complète ou juste "entreprise.fr")
export function cleanDomain(input: string): string {
  let domain = input.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//, "");
  domain = domain.replace(/^www\./, "");
  domain = domain.split("/")[0];
  return domain;
}

// Retire les accents pour construire des adresses email plausibles (a-marie -> a-marie, é -> e...)
function normalize(part: string): string {
  return part
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}

// Génère les schémas d'adresses email les plus courants en entreprise, du plus au moins probable.
export function generateEmailPatterns(firstName: string, lastName: string, domain: string): string[] {
  const f = normalize(firstName);
  const l = normalize(lastName);
  const d = cleanDomain(domain);

  if (!f || !l || !d) return [];

  const patterns = [
    `${f}.${l}@${d}`,
    `${f[0]}${l}@${d}`,
    `${f}${l}@${d}`,
    `${f}@${d}`,
    `${l}.${f}@${d}`,
    `${f}-${l}@${d}`,
    `${f[0]}.${l}@${d}`,
    `${l}@${d}`,
  ];

  return Array.from(new Set(patterns));
}

/**
 * Point d'entrée pour la recherche d'email.
 *
 * Si HUNTER_API_KEY est configurée, interroge l'API Hunter.io (Email Finder)
 * pour obtenir l'adresse la plus probable, avec un vrai niveau de confiance.
 * Sinon, repli sur une génération locale des schémas d'adresses les plus courants
 * (non vérifiés — l'existence réelle de l'adresse n'est pas garantie).
 */
export async function findEmail(params: FindEmailParams): Promise<{ best: EmailGuess | null; alternatives: string[] }> {
  const apiKey = process.env.HUNTER_API_KEY;
  const domain = cleanDomain(params.domain);

  if (apiKey && domain) {
    try {
      const url = new URL("https://api.hunter.io/v2/email-finder");
      url.searchParams.set("domain", domain);
      url.searchParams.set("first_name", params.firstName);
      url.searchParams.set("last_name", params.lastName);
      url.searchParams.set("api_key", apiKey);

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        const email = data?.data?.email;
        if (email) {
          return {
            best: { email, confidence: "verifiee" },
            alternatives: generateEmailPatterns(params.firstName, params.lastName, domain).filter((e) => e !== email),
          };
        }
      }
    } catch (err) {
      console.error("Erreur Hunter.io, repli sur la génération locale :", err);
    }
  }

  const patterns = generateEmailPatterns(params.firstName, params.lastName, domain);
  if (patterns.length === 0) return { best: null, alternatives: [] };

  return {
    best: { email: patterns[0], confidence: "estimee" },
    alternatives: patterns.slice(1),
  };
}
