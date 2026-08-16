import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { submitApplication } from "@/lib/labonnealternance";
import { addBusinessDays } from "@/lib/utils";
import { FREE_APPLICATIONS_LIMIT } from "@/lib/plan";

const RECOMMENDED_FOLLOWUP_DAYS = 7;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId, company, role, applyUrl, jobDescription, message } = body as {
      recipientId: string;
      company: string;
      role: string;
      applyUrl?: string;
      jobDescription?: string;
      message?: string;
    };

    if (!recipientId || !company || !role) {
      return NextResponse.json({ error: "Informations manquantes sur l'offre." }, { status: 400 });
    }

    // --- 1. Profil complet requis pour candidater ---
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone, cv_file_path, plan, total_applications_created, bonus_applications")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (!profile?.phone) {
      return NextResponse.json(
        { error: "Ajoutez votre numéro de téléphone dans « Mon profil » avant de candidater en 1 clic." },
        { status: 400 }
      );
    }
    if (!profile?.cv_file_path) {
      return NextResponse.json(
        { error: "Déposez votre CV dans « Mon profil » avant de candidater en 1 clic." },
        { status: 400 }
      );
    }
    if (!userData.user.email) {
      return NextResponse.json({ error: "Aucune adresse email associée à votre compte." }, { status: 400 });
    }

    // --- 2. Même limite que l'ajout manuel d'une candidature, pour ne pas la contourner ---
    const effectiveLimit = FREE_APPLICATIONS_LIMIT + (profile.bonus_applications ?? 0);
    if (profile.plan !== "premium" && (profile.total_applications_created ?? 0) >= effectiveLimit) {
      return NextResponse.json(
        { error: "Limite de candidatures gratuites atteinte. Passez à Étudiant+ pour continuer." },
        { status: 403 }
      );
    }

    // --- 3. Récupération du vrai fichier CV depuis le stockage ---
    const { data: cvFile, error: downloadError } = await supabase.storage.from("cvs").download(profile.cv_file_path);
    if (downloadError || !cvFile) {
      return NextResponse.json({ error: "Impossible de récupérer votre CV. Réessayez de le déposer." }, { status: 500 });
    }
    const cvBuffer = Buffer.from(await cvFile.arrayBuffer());
    const cvBase64 = cvBuffer.toString("base64");
    const cvFileName = profile.cv_file_path.split("/").pop() || "cv.pdf";

    // --- 4. Envoi réel de la candidature via l'API ---
    try {
      await submitApplication({
        recipientId,
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: userData.user.email,
        phone: profile.phone,
        cvFileName,
        cvBase64,
        message,
      });
    } catch (err) {
      console.error("Erreur envoi candidature La bonne alternance:", err);
      return NextResponse.json(
        { error: "Impossible d'envoyer la candidature pour le moment. Réessayez dans quelques instants." },
        { status: 502 }
      );
    }

    // --- 5. Ajout automatique au suivi des candidatures, comme une candidature classique ---
    const today = todayIso();
    const { error: insertError } = await supabase.from("applications").insert({
      user_id: userData.user.id,
      company,
      role,
      offer_url: applyUrl ?? null,
      applied_at: today,
      status: "envoyee",
      job_description: jobDescription ?? null,
      next_followup_at: addBusinessDays(today, RECOMMENDED_FOLLOWUP_DAYS),
      comment: "Candidature envoyée automatiquement via La bonne alternance (1 clic).",
    });

    if (insertError) {
      // La candidature est bien partie au recruteur — seul le suivi interne a échoué.
      console.error("Candidature envoyée mais échec de l'ajout au suivi:", insertError);
      return NextResponse.json({
        success: true,
        warning: "Candidature envoyée, mais elle n'a pas pu être ajoutée automatiquement à votre suivi.",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur inattendue candidature 1 clic:", err);
    return NextResponse.json({ error: "Une erreur inattendue est survenue." }, { status: 500 });
  }
}
