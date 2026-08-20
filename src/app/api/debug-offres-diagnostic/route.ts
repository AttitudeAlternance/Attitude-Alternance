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
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ville = searchParams.get("ville");
  const rayon = parseInt(searchParams.get("rayon") ?? "30", 10);
  const secteursParam = searchParams.get("secteurs");

  if (!ville) {
    return NextResponse.json({
      erreur: "Ajoutez ?ville=NomDeVille à l'URL (et éventuellement &secteurs=commerce,marketing&rayon=30).",
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
  const romes = sectorsToRomeCodes(secteurKeys);

  const url = new URL("https://api.apprentissage.beta.gouv.fr/api/job/v1/search");
  url.searchParams.set("latitude", geo.latitude.toString());
  url.searchParams.set("longitude", geo.longitude.toString());
  url.searchParams.set("radius", rayon.toString());
  url.searchParams.set("romes", romes.join(","));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });

  const rawBody = await response.text();

  if (!response.ok) {
    return NextResponse.json({
      erreur: "L'API a répondu une erreur.",
      statut_http: response.status,
      corps_reponse: rawBody.slice(0, 1000),
      url_appelee: url.toString(),
    }, { status: response.status });
  }

  const data = JSON.parse(rawBody);
  const jobs: any[] = Array.isArray(data?.jobs) ? data.jobs : [];
  const recruiters: any[] = Array.isArray(data?.recruiters) ? data.recruiters : [];

  const jobsResume = jobs
    .map((j) => ({
      titre: j?.offer?.title ?? null,
      entreprise: j?.workplace?.name ?? j?.workplace?.brand ?? j?.workplace?.legal_name ?? null,
      date_publication: j?.offer?.publication?.creation ?? null,
    }))
    .sort((a, b) => {
      if (!a.date_publication) return 1;
      if (!b.date_publication) return -1;
      return new Date(b.date_publication).getTime() - new Date(a.date_publication).getTime();
    });

  return NextResponse.json({
    ville_demandee: ville,
    ville_geocodee: geo.label,
    coordonnees: { latitude: geo.latitude, longitude: geo.longitude },
    rayon_km: rayon,
    secteurs_utilises: secteurKeys,
    codes_rome_envoyes: romes,
    nombre_codes_rome: romes.length,
    url_appelee_a_lapi: url.toString(),

    // Ce que notre code ignore aujourd'hui — à regarder en priorité pour savoir s'il y a de la
    // pagination ou un total non exploité par notre code.
    cles_racine_de_la_reponse_brute: Object.keys(data ?? {}),

    nombre_offres_recues: jobs.length,
    nombre_candidatures_spontanees_recues: recruiters.length,
    liste_des_offres_recues: jobsResume,
  });
}
