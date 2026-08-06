// Client serveur pour l'API "La bonne alternance" (Mission Apprentissage).
//
// Authentification : une clé API statique (LBA_API_KEY, générée sur le compte
// api.apprentissage.beta.gouv.fr), utilisée directement en en-tête Authorization — pas de
// circuit OAuth avec jeton temporaire à renouveler, contrairement aux API France Travail
// classiques (Stripe/Resend suivent un principe similaire de clé fixe).
const SEARCH_URL = "https://api.apprentissage.beta.gouv.fr/api/job/v1/search";

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
  url.searchParams.set("romes", romes.join(","));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const rawBody = await response.text();

  // Diagnostic renforcé : si la réponse n'est pas du JSON (ou si le statut n'est pas 2xx), on
  // inclut le statut HTTP réel, le type de contenu et un extrait du corps dans l'erreur — pour
  // voir précisément ce qui bloque plutôt qu'un simple "ce n'est pas du JSON".
  if (!contentType.includes("application/json") || !response.ok) {
    throw new Error(
      `Réponse inattendue de La bonne alternance — statut ${response.status}, type "${contentType}" : ${rawBody.slice(0, 400)}`
    );
  }

  const data = JSON.parse(rawBody);

  const jobs: any[] = Array.isArray(data?.jobs) ? data.jobs : [];
  const recruiters: any[] = Array.isArray(data?.recruiters) ? data.recruiters : [];

  const jobResults: OfferResult[] = jobs.map((job, index) => ({
    id: job?.identifier?.id ?? `offre-${index}`,
    title: job?.offer?.title ?? "Poste en alternance",
    company: job?.workplace?.name ?? job?.workplace?.brand ?? job?.workplace?.legal_name ?? "Entreprise non précisée",
    city: job?.workplace?.location?.address ?? null,
    contractType: Array.isArray(job?.contract?.type) ? job.contract.type.join(", ") : null,
    description: job?.offer?.description ?? null,
    applyUrl: job?.apply?.url ?? null,
    isSpontaneous: false,
  }));

  // Les "recruteurs" sont des entreprises à fort potentiel n'ayant publié aucune offre : la
  // candidature spontanée leur est suggérée, sans intitulé de poste ni description associée.
  const recruiterResults: OfferResult[] = recruiters.map((rec, index) => ({
    id: rec?.identifier?.id ?? `recruteur-${index}`,
    title: "Candidature spontanée suggérée",
    company: rec?.workplace?.name ?? rec?.workplace?.brand ?? rec?.workplace?.legal_name ?? "Entreprise non précisée",
    city: rec?.workplace?.location?.address ?? null,
    contractType: null,
    description: rec?.workplace?.description ?? null,
    applyUrl: rec?.apply?.url ?? null,
    isSpontaneous: true,
  }));

  return [...jobResults, ...recruiterResults];
}

