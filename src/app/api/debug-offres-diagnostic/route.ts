import { NextResponse } from "next/server";
import { geocodeCity } from "@/lib/geocode";
import { SECTOR_OPTIONS, sectorsToRomeCodes } from "@/lib/romeSecteurs";

// Route de DIAGNOSTIC TEMPORAIRE, à retirer une fois l'écart avec le site officiel élucidé.
// Objectif : voir exactement ce que l'API "La bonne alternance" nous renvoie pour une recherche
// donnée — y compris des informations que notre code ignore aujourd'hui (structure brute de la
// réponse, présence éventuelle d'une pagination/d'un total non exploité) — pour distinguer
// clairement : (a) un problème de codes ROME trop étroits, (b) un problème de géocodage
// (coordonnées différentes du site officiel pour la "même" ville), (c) une limite de résultats
// par appel (pagination) que notre code n'exploite pas, ou (d) autre chose.
//
// Usage : ouvrir dans le navigateur, ex.
// https://attitude-alternance.vercel.app/api/debug-offres-diagnostic?ville=Bordeaux&secteurs=commerce&rayon=30
// (secteurs = clés séparées par des virgules, voir la liste dans "secteurs_disponibles" si omis)
//
// Mode comparaison (&comparer=1) : lance DEUX recherches (tous les secteurs du site combinés, et
// sans aucun filtre ROME) et calcule automatiquement la différence — la liste des offres visibles
// sans filtre mais absentes avec nos secteurs. Évite d'avoir à comparer deux longues listes à la
// main, ce qui est long et source d'erreur.
interface JobResume {
  titre: string | null;
  entreprise: string | null;
  date_publication: string | null;
  // Codes ROME réellement attribués à l'offre par l'API elle-même — ajouté le 01/09/2026 pour
  // arrêter de DEVINER à partir du titre pourquoi une offre est "manquante" et voir la vraie
  // cause : soit ces codes ne sont vraiment dans aucun de nos secteurs (vrai manque à combler),
  // soit ils y sont déjà et l'offre a une autre explication (bug de dédoublonnage, décalage de
  // dates, etc.). La forme exacte du champ dans la réponse brute n'étant pas garantie (chaîne
  // simple ou objet {code, label}), on gère les deux cas défensivement (voir extraireCodesRome).
  codes_rome: string[];
}

// L'API peut renvoyer les codes ROME de plusieurs façons selon les endpoints/versions :
// tantôt une simple liste de chaînes (["D1502"]), tantôt une liste d'objets ({code, label}).
// On normalise vers une liste de chaînes quoi qu'il arrive, sans jamais planter si le champ
// est absent ou dans un format inattendu.
function extraireCodesRome(offer: any): string[] {
  const brut = offer?.rome_codes ?? offer?.romes ?? offer?.rome ?? null;
  if (!Array.isArray(brut)) return [];
  return brut
    .map((item: any) => (typeof item === "string" ? item : item?.code ?? item?.rome ?? null))
    .filter((code: unknown): code is string => typeof code === "string" && code.length > 0);
}

function cleKey(j: JobResume): string {
  return `${(j.titre ?? "").trim().toLowerCase()}|${(j.entreprise ?? "").trim().toLowerCase()}`;
}

async function chercherOffres(
  apiKey: string,
  geo: { latitude: number; longitude: number },
  rayon: number,
  romes: string[] | null // null = pas de filtre ROME du tout
): Promise<{ jobsResume: JobResume[]; url: string } | { erreur: string; statut_http: number; corps: string; url: string }> {
  const url = new URL("https://api.apprentissage.beta.gouv.fr/api/job/v1/search");
  url.searchParams.set("latitude", geo.latitude.toString());
  url.searchParams.set("longitude", geo.longitude.toString());
  url.searchParams.set("radius", rayon.toString());
  if (romes) {
    url.searchParams.set("romes", romes.join(","));
  }

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });
  const rawBody = await response.text();

  if (!response.ok) {
    return { erreur: "L'API a répondu une erreur.", statut_http: response.status, corps: rawBody.slice(0, 1000), url: url.toString() };
  }

  const data = JSON.parse(rawBody);
  const jobs: any[] = Array.isArray(data?.jobs) ? data.jobs : [];

  const jobsResume: JobResume[] = jobs.map((j) => ({
    titre: j?.offer?.title ?? null,
    entreprise: j?.workplace?.name ?? j?.workplace?.brand ?? j?.workplace?.legal_name ?? null,
    date_publication: j?.offer?.publication?.creation ?? null,
    codes_rome: extraireCodesRome(j?.offer),
  }));

  return { jobsResume, url: url.toString() };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ville = searchParams.get("ville");
  const rayon = parseInt(searchParams.get("rayon") ?? "30", 10);
  const secteursParam = searchParams.get("secteurs");
  const sansFiltreRome = searchParams.get("sans_filtre_rome") === "1";
  const modeComparaison = searchParams.get("comparer") === "1";

  if (!ville) {
    return NextResponse.json({
      erreur: "Ajoutez ?ville=NomDeVille à l'URL (et éventuellement &secteurs=commerce,marketing&rayon=30, ou &comparer=1).",
      secteurs_disponibles: SECTOR_OPTIONS.map((s) => s.key),
    }, { status: 400 });
  }

  const apiKey = process.env.LBA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erreur: "Clé API manquante (LBA_API_KEY)." }, { status: 500 });
  }

  const geo = await geocodeCity(ville);
  if (!geo) {
    return NextResponse.json({ erreur: `Ville "${ville}" introuvable via le géocodeur.` }, { status: 400 });
  }

  const secteurKeys = secteursParam ? secteursParam.split(",").map((s) => s.trim()) : SECTOR_OPTIONS.map((s) => s.key);
  const romesTousSecteurs = sectorsToRomeCodes(SECTOR_OPTIONS.map((s) => s.key));

  // --- Mode comparaison : calcule automatiquement l'écart entre "tous nos secteurs" et "aucun filtre" ---
  if (modeComparaison) {
    const [avecSecteurs, sansFiltre] = await Promise.all([
      chercherOffres(apiKey, geo, rayon, romesTousSecteurs),
      chercherOffres(apiKey, geo, rayon, null),
    ]);

    if ("erreur" in avecSecteurs) return NextResponse.json(avecSecteurs, { status: avecSecteurs.statut_http });
    if ("erreur" in sansFiltre) return NextResponse.json(sansFiltre, { status: sansFiltre.statut_http });

    const clesCouvertes = new Set(avecSecteurs.jobsResume.map(cleKey));
    const romesCouvertsSet = new Set(romesTousSecteurs);
    const seenManquantes = new Set<string>();
    const manquantes: (JobResume & { anomalie_code_deja_couvert: boolean })[] = [];
    for (const j of sansFiltre.jobsResume) {
      const cle = cleKey(j);
      if (clesCouvertes.has(cle) || seenManquantes.has(cle)) continue;
      seenManquantes.add(cle);
      // Si au moins un des codes ROME réels de cette offre fait DÉJÀ partie de nos 8 secteurs,
      // ce n'est pas un manque de code ROME — l'offre a disparu pour une autre raison (à
      // investiguer spécifiquement : dédoublonnage, décalage de date, etc.). true = anomalie
      // à creuser en priorité ; false = vrai candidat à un nouveau code ROME.
      const anomalie = j.codes_rome.some((code) => romesCouvertsSet.has(code));
      manquantes.push({ ...j, anomalie_code_deja_couvert: anomalie });
    }
    manquantes.sort((a, b) => {
      if (!a.date_publication) return 1;
      if (!b.date_publication) return -1;
      return new Date(b.date_publication).getTime() - new Date(a.date_publication).getTime();
    });

    const uniquesAvecSecteurs = new Set(avecSecteurs.jobsResume.map(cleKey)).size;
    const uniquesSansFiltre = new Set(sansFiltre.jobsResume.map(cleKey)).size;
    const nombreAnomalies = manquantes.filter((m) => m.anomalie_code_deja_couvert).length;

    return NextResponse.json({
      ville_geocodee: geo.label,
      rayon_km: rayon,
      nombre_offres_uniques_avec_nos_8_secteurs: uniquesAvecSecteurs,
      nombre_offres_uniques_sans_aucun_filtre: uniquesSansFiltre,
      nombre_offres_manquantes: manquantes.length,
      nombre_anomalies_code_deja_couvert: nombreAnomalies,
      note: "Chaque offre manquante a maintenant son champ codes_rome (les vrais codes envoyés par l'API) et anomalie_code_deja_couvert (true = un de ces codes est déjà dans nos 8 secteurs, donc ce n'est PAS un manque de code ROME — à investiguer autrement ; false = vrai candidat à un nouveau code ROME, à vérifier avant ajout). Le reste de la liste peut aussi inclure des offres légitimement hors périmètre (boulangerie, BTP, aéronautique, santé, esthétique...).",
      offres_manquantes: manquantes,
    });
  }

  // --- Mode normal (comportement existant, inchangé) ---
  const romes = sectorsToRomeCodes(secteurKeys);
  const resultat = await chercherOffres(apiKey, geo, rayon, sansFiltreRome ? null : romes);
  if ("erreur" in resultat) return NextResponse.json(resultat, { status: resultat.statut_http });

  const jobsResume = [...resultat.jobsResume].sort((a, b) => {
    if (!a.date_publication) return 1;
    if (!b.date_publication) return -1;
    return new Date(b.date_publication).getTime() - new Date(a.date_publication).getTime();
  });

  const clesUniques = new Set(jobsResume.map(cleKey));

  return NextResponse.json({
    recherche_sans_filtre_rome: sansFiltreRome,
    nombre_offres_uniques_apres_deduplication_titre_entreprise: clesUniques.size,
    nombre_doublons_detectes: jobsResume.length - clesUniques.size,
    ville_demandee: ville,
    ville_geocodee: geo.label,
    coordonnees: { latitude: geo.latitude, longitude: geo.longitude },
    rayon_km: rayon,
    secteurs_utilises: sansFiltreRome ? "aucun filtre — tous secteurs confondus" : secteurKeys,
    codes_rome_envoyes: sansFiltreRome ? "aucun (paramètre romes omis)" : romes,
    nombre_codes_rome: sansFiltreRome ? 0 : romes.length,
    url_appelee_a_lapi: resultat.url,
    nombre_offres_recues: resultat.jobsResume.length,
    liste_des_offres_recues: jobsResume,
  });
}
