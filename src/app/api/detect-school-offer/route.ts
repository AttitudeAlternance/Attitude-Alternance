import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAndConsumeAiQuota } from "@/lib/aiUsage";
import { detectSchoolOfferWithAi } from "@/lib/ai/detectSchoolOffer";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { text, offerUrl } = (await request.json()) as { text?: string; offerUrl?: string };

  if (!text || text.trim().length < 30) {
    return NextResponse.json(
      { error: "Collez un texte d'offre suffisamment complet (ou récupérez-le depuis le lien) pour lancer l'analyse." },
      { status: 400 }
    );
  }

  const quota = await checkAndConsumeAiQuota(supabase, userData.user.id);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: `Limite de ${quota.limit} analyses IA atteinte pour aujourd'hui. Réessayez demain, ou passez à Étudiant+ pour un quota plus élevé.` },
      { status: 429 }
    );
  }

  const result = await detectSchoolOfferWithAi(text, offerUrl);
  return NextResponse.json(result);
}
