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
  publicationDate: string | null;
  recipientId: string | null;
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
    publicationDate: job?.offer?.publication?.creation ?? null,
    recipientId: job?.apply?.recipient_id ?? null,
  }));

  // Les "recruteurs" sont des entreprises à fort potentiel n'ayant publié aucune offre : la
  // candidature spontanée leur est suggérée, sans intitulé de poste ni date de publication.
  const recruiterResults: OfferResult[] = recruiters.map((rec, index) => ({
    id: rec?.identifier?.id ?? `recruteur-${index}`,
    title: "Candidature spontanée suggérée",
    company: rec?.workplace?.name ?? rec?.workplace?.brand ?? rec?.workplace?.legal_name ?? "Entreprise non précisée",
    city: rec?.workplace?.location?.address ?? null,
    contractType: null,
    description: rec?.workplace?.description ?? null,
    applyUrl: rec?.apply?.url ?? null,
    isSpontaneous: true,
    publicationDate: null,
    recipientId: rec?.apply?.recipient_id ?? null,
  }));

  // Tri des vraies offres par date de publication décroissante (les plus récentes en premier).
  // Les offres sans date connue (rare, mais possible selon les entreprises) sont reléguées à la
  // fin de ce groupe plutôt que de casser le tri. Les candidatures spontanées suggérées
  // ("recruteurs", sans date de publication puisqu'il n'y a pas d'offre) restent affichées après,
  // comme avant — ce sont des suggestions, pas des offres datées, ça n'a pas de sens de les mêler
  // au tri chronologique.
  const sortedJobResults = [...jobResults].sort((a, b) => {
    if (!a.publicationDate && !b.publicationDate) return 0;
    if (!a.publicationDate) return 1;
    if (!b.publicationDate) return -1;
    return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
  });

  return [...sortedJobResults, ...recruiterResults];
}

export interface SubmitApplicationParams {
  recipientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cvFileName: string;
  cvBase64: string;
  message?: string;
}

/**
 * Envoie une candidature directement via l'API La bonne alternance (POST /job/v1/apply) —
 * l'étudiant ne quitte jamais le site, c'est l'API qui transmet le CV et le message au
 * recruteur par email. Ne fonctionne que pour les offres dont recipientId n'est pas null.
 */
export async function submitApplication(params: SubmitApplicationParams): Promise<void> {
  const apiKey = process.env.LBA_API_KEY;
  if (!apiKey) {
    throw new Error("Clé API La bonne alternance manquante (LBA_API_KEY).");
  }

  const response = await fetch("https://api.apprentissage.beta.gouv.fr/api/job/v1/apply", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      applicant_first_name: params.firstName,
      applicant_last_name: params.lastName,
      applicant_email: params.email,
      applicant_phone: params.phone,
      applicant_attachment_name: params.cvFileName,
      applicant_attachment_content: params.cvBase64,
      recipient_id: params.recipientId,
      applicant_message: params.message ?? null,
    }),
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(
      `Erreur lors de l'envoi de la candidature (statut ${response.status}, type "${contentType}") : ${rawBody.slice(0, 400)}`
    );
  }
}

