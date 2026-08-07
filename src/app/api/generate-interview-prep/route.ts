import { NextResponse } from "next/server";
import { generateInterviewPrep } from "@/lib/ai/generateInterviewPrep";
import { createClient } from "@/lib/supabase/server";
import { checkAndConsumeAiQuota } from "@/lib/aiUsage";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const quota = await checkAndConsumeAiQuota(supabase, userData.user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `Limite de ${quota.limit} générations IA atteinte pour aujourd'hui. Réessayez demain, ou passez à Étudiant+ pour un quota plus élevé.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { company, role, jobDescription, cvSummary, firstName, formation } = body as {
      company: string;
      role: string;
      jobDescription?: string;
      cvSummary?: string;
      firstName?: string;
      formation?: string;
    };

    if (!company || !role) {
      return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
    }

    const result = await generateInterviewPrep({ company, role, jobDescription, cvSummary, firstName, formation });

    return NextResponse.json({ prep: result.prep, usedRealAi: result.usedRealAi });
  } catch (err) {
    console.error("Erreur génération préparation d'entretien:", err);
    return NextResponse.json({ error: "Erreur lors de la génération de la préparation." }, { status: 500 });
  }
}
