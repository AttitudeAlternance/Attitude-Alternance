import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchAlternanceOffers } from "@/lib/labonnealternance";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: Request) {
  // Réservé aux étudiants connectés — pas d'appel anonyme à l'API pour rester raisonnable
  // sur le volume d'appels (quota partagé côté France Travail).
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const latitude = parseFloat(searchParams.get("lat") ?? "");
  const longitude = parseFloat(searchParams.get("lon") ?? "");
  const radius = parseInt(searchParams.get("radius") ?? "30", 10);
  const romes = searchParams.getAll("rome");

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return NextResponse.json({ error: "Localisation manquante ou invalide." }, { status: 400 });
  }
  if (romes.length === 0) {
    return NextResponse.json({ error: "Sélectionnez au moins un secteur." }, { status: 400 });
  }

  try {
    const offers = await searchAlternanceOffers({ latitude, longitude, radius, romes });
    return NextResponse.json({ offers });
  } catch (err) {
    console.error("Erreur recherche La bonne alternance:", err);
    return NextResponse.json(
      { error: "Impossible de récupérer les offres pour le moment. Réessayez dans quelques instants." },
      { status: 502 }
    );
  }
}
