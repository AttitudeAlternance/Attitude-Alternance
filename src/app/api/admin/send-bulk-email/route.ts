import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sendEmail";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_RECIPIENTS = 150;
const DELAY_BETWEEN_SENDS_MS = 300;

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // Vérifie que l'appelant est bien l'administrateur du site avant toute action.
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!myProfile?.is_admin) {
    return NextResponse.json({ error: "Accès réservé à l'administrateur." }, { status: 403 });
  }

  const { userIds, subject, message } = (await request.json()) as {
    userIds?: string[];
    subject?: string;
    message?: string;
  };

  if (!userIds || userIds.length === 0) {
    return NextResponse.json({ error: "Aucun destinataire sélectionné." }, { status: 400 });
  }
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Le sujet et le message sont obligatoires." }, { status: 400 });
  }
  if (userIds.length > MAX_RECIPIENTS) {
    return NextResponse.json(
      { error: `Trop de destinataires en un seul envoi (max ${MAX_RECIPIENTS}). Faites plusieurs envois.` },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // On ne s'envoie jamais un email groupé à soi-même par ce canal (déjà exclu de la liste
  // affichée côté page admin, mais on revérifie ici par sécurité).
  const targetIds = userIds.filter((id) => id !== userData.user!.id);

  const { data: recipients, error } = await admin
    .from("profiles")
    .select("id, email, first_name")
    .in("id", targetIds);

  if (error) {
    return NextResponse.json({ error: "Impossible de récupérer les destinataires." }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const recipient of recipients ?? []) {
    if (!recipient.email) {
      skipped += 1;
      continue;
    }

    const personalized = message.replaceAll("{prenom}", recipient.first_name || "");
    const html = paragraphsToHtml(personalized);

    const ok = await sendEmail({ to: recipient.email, subject, html });
    if (ok) {
      sent += 1;
    } else {
      failed += 1;
    }

    // Petite pause entre chaque envoi pour rester raisonnable vis-à-vis de l'API Resend.
    await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_SENDS_MS));
  }

  return NextResponse.json({ sent, failed, skipped, total: recipients?.length ?? 0 });
}

// Transforme un texte brut (ligne vide = nouveau paragraphe) en HTML simple, échappé.
function paragraphsToHtml(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
