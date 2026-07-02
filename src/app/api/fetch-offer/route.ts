import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const BLOCKED_HOSTS = [
  "linkedin.com",
  "indeed.com",
  "indeed.fr",
  "welcometothejungle.com",
  "glassdoor.com",
  "glassdoor.fr",
];

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { url } = (await request.json()) as { url?: string };

  if (!url) {
    return NextResponse.json({ error: "Lien manquant." }, { status: 400 });
  }

  let hostname: string;
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return NextResponse.json({ error: "Lien invalide." }, { status: 400 });
  }

  if (BLOCKED_HOSTS.some((h) => hostname.includes(h))) {
    return NextResponse.json(
      {
        error:
          "Ce site (LinkedIn, Indeed, Welcome to the Jungle...) bloque la récupération automatique. Copiez-collez le texte de l'offre manuellement.",
      },
      { status: 422 }
    );
  }

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Impossible d'accéder à cette page. Copiez-collez le texte de l'offre manuellement." },
        { status: 422 }
      );
    }

    const html = await response.text();
    const cheerio = await import("cheerio");
    const $ = cheerio.load(html);

    $("script, style, nav, header, footer, noscript, svg, iframe").remove();

    const text = $("body").text().replace(/\s+/g, " ").trim();

    if (!text || text.length < 200) {
      return NextResponse.json(
        {
          error:
            "Le texte de cette page n'a pas pu être lu correctement (probablement chargé en JavaScript). Copiez-collez le texte de l'offre manuellement.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: text.slice(0, 8000) });
  } catch {
    return NextResponse.json(
      { error: "Cette page n'a pas pu être récupérée. Copiez-collez le texte de l'offre manuellement." },
      { status: 422 }
    );
  }
}
