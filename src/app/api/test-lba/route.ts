import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.LBA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "La variable d'environnement LBA_API_KEY n'est pas définie." },
      { status: 500 }
    );
  }

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
        cache: "no-store",
      }
    );

    if (!response.ok) {
