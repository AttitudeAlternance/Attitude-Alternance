// Constantes centralisant les limites de l'offre gratuite et les plafonds d'usage IA.
// Modifier ces valeurs ici suffit à ajuster le comportement dans toute l'application.

export const FREE_APPLICATIONS_LIMIT = 15;

// Plafonds d'appels IA (génération de message + analyse de CV + score de correspondance)
// par utilisateur et par jour, pour se prémunir d'un usage excessif de la clé API.
export const FREE_AI_DAILY_LIMIT = 10;
export const PREMIUM_AI_DAILY_LIMIT = 60;

export type Plan = "free" | "premium";

export function aiDailyLimitForPlan(plan: Plan): number {
  return plan === "premium" ? PREMIUM_AI_DAILY_LIMIT : FREE_AI_DAILY_LIMIT;
}
