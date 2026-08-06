// Client serveur pour l'API "La bonne alternance" (Mission Apprentissage).
//
// Authentification : une clé API statique (LBA_API_KEY, générée sur le compte
// api.apprentissage.beta.gouv.fr), utilisée directement en en-tête Authorization — pas de
// circuit OAuth avec jeton temporaire à renouveler, contrairement aux API France Travail
// classiques (Stripe/Resend suivent un principe similaire de clé fixe).
const SEARCH_URL = "https://api.apprentissage.beta.gouv.fr/v1/jobs/search";

export interface OfferSearchParams {
  latitude: number;
  longitude: number;
  radius: number;
  romes: string[];
}

export interface OfferResult {
  id: string;
  title: string;
  company: string;
  city: string | null;
  contractType: string | null;
  description: string | null;
  applyUrl: string | null;
  isSpontaneous: boolean;
}

export async function searchAlternanceOffers({
  latitude,
  longitude,
  radius,
  romes,
}: OfferSearchParams): Promise<OfferResult[]> {
  const apiKey = process.env.LBA_API_KEY;
  if (!apiKey) {
    throw new Error("Clé API La bonne alternance manquante (LBA_API_KEY).");
  }

  const url = new URL(SEARCH_URL);
  url.searchParams.set("latitude", latitude.toString());
  url.searchParams.set("longitude", longitude.toString());
  url.searchParams.set("radius", radius.toString());
  romes.forEach((code) => url.searchParams.append("romes", code));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Erreur API La bonne alternance (${response.status}) : ${body}`);
  }

  const data = await response.json();

  // La forme exacte de la réponse (jobs.results vs results à la racine, noms de champs) a été
  // reconstituée à partir de la documentation publique du service, avec plusieurs replis
  // défensifs — à ajuster si la structure réelle diffère légèrement une fois testée en vrai.
  const rawJobs: any[] = data?.jobs?.results ?? data?.jobs ?? data?.results ?? [];

  return rawJobs.map((job, index) => ({
    id: job?.identifier?.id ?? job?.id ?? `offre-${index}`,
    title: job?.offer?.title ?? job?.title ?? "Poste en alternance",
    company:
      job?.workplace?.name ??
      job?.workplace?.brand ??
      job?.workplace?.legal_name ??
      "Entreprise non précisée",
    city: job?.workplace?.location?.address ?? job?.workplace?.location?.city ?? null,
    contractType: job?.contract?.type ?? null,
    description: job?.offer?.description ?? null,
    applyUrl: job?.apply?.url ?? null,
    isSpontaneous: job?.identifier?.partner_label === "OFFRES_EMPLOI_LBA" ? false : Boolean(job?.recruiter),
  }));
}

