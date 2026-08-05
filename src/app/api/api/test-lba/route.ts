import { NextResponse } from "next/server";

// Route de TEST pour valider la connexion à l'API "La bonne alternance".
// À visiter dans le navigateur une fois déployé : /api/test-lba
// Peut être supprimée une fois la connexion validée.

export async function GET() {
  const apiKey = process.env.LBA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "La variable d'environnement LBA_API_KEY n'est pas définie." },
      { status: 500 }
    );
  }

  // Exemple : recherche d'offres en alternance dans le secteur "Commerce"
  // (code ROME D1214 = Vente en habillement et accessoires de la personne, à titre d'exemple)
  // autour de Bordeaux, dans un rayon de 30km.
  const params = new URLSearchParams({
    romes: "D1214",
    latitude: "44.8378",
    longitude: "-0.5792",
    radius: "30",
  });

  try {
    const response = await fetch(
      `https://api.apprentissage.beta.gouv.fr/api/job/v1/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        // Pas de cache pour ce test
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        {
          error: "Erreur renvoyée par l'API La bonne alternance",
          status: response.status,
          details: errorBody,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // On renvoie juste un résumé pour vérifier que ça fonctionne,
    // pas besoin de tout afficher.
    return NextResponse.json({
      success: true,
      nombre_offres: data.jobs?.length ?? 0,
      nombre_recruteurs: data.recruiters?.length ?? 0,
      avertissements: data.warnings ?? [],
      premiere_offre: data.jobs?.[0] ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erreur lors de l'appel à l'API", details: String(err) },
      { status: 500 }
    );
  }
}
