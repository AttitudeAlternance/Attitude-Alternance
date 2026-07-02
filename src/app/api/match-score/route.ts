import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAndConsumeAiQuota } from "@/lib/aiUsage";
import { computeMatchScore } from "@/lib/ai/matchScore";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const quota = await checkAndConsumeAiQuota(supabase, userData.user.id);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: `Limite de ${quota.limit} analyses IA atteinte pour aujourd'hui. Réessayez demain, ou passez à Étudiant+ pour un quota plus élevé.` },
      { status: 429 }
    );
  }

  const { cvSummary, jobDescription } = (await request.json()) as { cvSummary?: string; jobDescription?: string };

  if (!cvSummary || !jobDescription) {
    return NextResponse.json(
      { error: "Un CV (dans votre profil) et une description d'offre sont nécessaires pour calculer un score." },
      { status: 400 }
    );
  }

  const result = await computeMatchScore({ cvSummary, jobDescription });
  return NextResponse.json(result);
}
