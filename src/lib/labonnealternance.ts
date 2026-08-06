// Client serveur pour l'API "La bonne alternance" (France Travail / Mission Apprentissage).
//
// ⚠️ Point d'attention laissé volontairement visible : l'authentification suit le schéma
// OAuth2 "client_credentials" utilisé par les API France Travail (identifiant + clé secrète
// -> jeton d'accès), avec un "scope" propre à cette API précise. Le nom exact de ce scope n'a
// pas pu être vérifié à distance (documentation technique en JavaScript, non lisible sans
// accès à l'espace développeur). Une valeur par défaut plausible est utilisée ci-dessous, mais
// elle est surchargeable via la variable d'environnement FRANCE_TRAVAIL_SCOPE sans toucher au
// code, au cas où l'appel échouerait avec une erreur "invalid_scope" au premier test.
const DEFAULT_SCOPE = "api_labonnealternancev1";
const TOKEN_URL = "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire";
const SEARCH_URL = "https://api.apprentissage.beta.gouv.fr/v1/jobs/search";

interface TokenCache {
  token: string;
  expiresAt: number;
}

// Le jeton est mis en cache en mémoire le temps de sa validité, pour éviter d'en redemander un
// nouveau à chaque recherche (les jetons France Travail durent généralement ~20 minutes).
let cachedToken: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5_000) {
    return cachedToken.token;
  }

  const clientId = process.env.FRANCE_TRAVAIL_CLIENT_ID;
  const clientSecret = process.env.FRANCE_TRAVAIL_CLIENT_SECRET;
  const scope = process.env.FRANCE_TRAVAIL_SCOPE || DEFAULT_SCOPE;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Identifiants France Travail manquants (FRANCE_TRAVAIL_CLIENT_ID / FRANCE_TRAVAIL_CLIENT_SECRET)."
    );
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Impossible d'obtenir un jeton France Travail (${response.status}) : ${body}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in?: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 1200) * 1000,
  };
  return cachedToken.token;
}

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
  const token = await getAccessToken();

  const url = new URL(SEARCH_URL);
  url.searchParams.set("latitude", latitude.toString());
  url.searchParams.set("longitude", longitude.toString());
  url.searchParams.set("radius", radius.toString());
  romes.forEach((code) => url.searchParams.append("romes", code));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
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
