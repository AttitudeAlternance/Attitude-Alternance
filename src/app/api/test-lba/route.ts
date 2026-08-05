import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.LBA_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Clé API manquante" }, { status: 500 });
  }

  const url = "https://api.apprentissage.beta.gouv.fr/api/job/v1/search?romes=D1214&latitude=44.8378&longitude=-0.5792&radius=30";

  const response = await fetch(url, {
    headers: { Authorization: "Bearer " + apiKey },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    return NextResponse.json({ error: "Erreur API", status: response.status, details: errorBody }, { status: response.status });
  }

  const data = await response.json();

  return NextResponse.json({
    success: true,
    nombre_offres: data.jobs ? data.jobs.length : 0,
    nombre_recruteurs: data.recruiters ? data.recruiters.length : 0,
  });
}
