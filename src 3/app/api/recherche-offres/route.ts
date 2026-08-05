import { NextRequest, NextResponse } from "next/server";

// Recherche d'offres d'alternance via l'API "La bonne alternance".
// Reçoit un code postal + une liste de codes ROME (secteurs), et renvoie
// les offres + entreprises à fort potentiel autour de cette zone.

export async function POST(request: NextRequest) {
  const apiKey = process.env.LBA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "La variable d'environnement LBA_API_KEY n'est pas définie." },
      { status: 500 }
    );
  }

  const body = await request.json();
  const codePostal: string = body.codePostal;
  const romes: string[] = body.romes || [];
  const radius: number = body.radius || 30;

  if (!codePostal || romes.length === 0) {
    return NextResponse.json(
      { error: "Code postal et au moins un secteur sont requis." },
      { status: 400 }
    );
  }

  // 1. Géocodage : on transforme le code postal en coordonnées GPS
  const communeRes = await fetch(
    `https://api.apprentissage.beta.gouv.fr/api/geographie/v1/commune/search?code=${encodeURIComponent(
      codePostal
    )}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    }
  );

  if (!communeRes.ok) {
    return NextResponse.json(
      { error: "Impossible de géolocaliser ce code postal." },
      { status: 400 }
    );
  }

  const communes = await communeRes.json();

  if (!communes || communes.length === 0) {
    return NextResponse.json(
      { error: "Code postal introuvable. Vérifiez qu'il est correct." },
      { status: 400 }
    );
  }

  const commune = communes[0];
  const [longitude, latitude] = commune.localisation.centre.coordinates;

  // 2. Recherche des offres autour de ces coordonnées
  const searchParams = new URLSearchParams({
    romes: romes.join(","),
    latitude: String(latitude),
    longitude: String(longitude),
    radius: String(radius),
  });

  const jobsRes = await fetch(
    `https://api.apprentissage.beta.gouv.fr/api/job/v1/search?${searchParams.toString()}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    }
  );

  if (!jobsRes.ok) {
    const errorBody = await jobsRes.text();
    return NextResponse.json(
      { error: "Erreur lors de la recherche d'offres.", details: errorBody },
      { status: jobsRes.status }
    );
  }

  const data = await jobsRes.json();

  // 3. On simplifie les résultats pour l'affichage côté étudiant
  const offres = (data.jobs || []).map((job: any) => ({
    id: job.identifier?.id || job.identifier?.partner_job_id,
    titre: job.offer?.title,
    entreprise: job.workplace?.name || "Entreprise non précisée",
    adresse: job.workplace?.location?.address || null,
    typeContrat: job.contract?.type?.join(" / ") || "Non précisé",
    dureeContratMois: job.contract?.duration || null,
    urlCandidature: job.apply?.url || null,
  }));

  const entreprisesPotentielles = (data.recruiters || []).map((rec: any) => ({
    nom: rec.workplace?.name || "Entreprise non précisée",
    adresse: rec.workplace?.location?.address || null,
  }));

  return NextResponse.json({
    commune: commune.nom,
    nombreOffres: offres.length,
    offres,
    entreprisesPotentielles,
  });
}
