export interface EmailGuess {
  email: string;
  confidence: "estimee";
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

// Retire les accents pour construire des adresses email plausibles
function normalize(part: string): string {
  return part
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}

// Génère les schémas d'adresses email les plus courants en entreprise, du plus au moins probable.
// Volontairement limité à 3 propositions : l'objectif est d'aider à cibler un mail de candidature
// ou une relance ponctuelle, pas d'encourager un envoi massif à de nombreuses adresses devinées.
export function generateEmailPatterns(firstName: string, lastName: string, domain: string): string[] {
  const f = normalize(firstName);
  const l = normalize(lastName);
  const d = cleanDomain(domain);

  if (!f || !l || !d) return [];

  const patterns = [`${f}.${l}@${d}`, `${f[0]}${l}@${d}`, `${f}@${d}`];

  return Array.from(new Set(patterns));
}

/**
 * Génère les adresses email les plus probables à partir des schémas courants
 * (prénom.nom@domaine, etc.). Ces adresses sont des estimations, jamais vérifiées :
 * à confirmer avant tout envoi important.
 */
export async function findEmail(params: FindEmailParams): Promise<{ best: EmailGuess | null; alternatives: string[] }> {
  const domain = cleanDomain(params.domain);
  const patterns = generateEmailPatterns(params.firstName, params.lastName, domain);
  if (patterns.length === 0) return { best: null, alternatives: [] };

  return {
    best: { email: patterns[0], confidence: "estimee" },
    alternatives: patterns.slice(1),
  };
}
