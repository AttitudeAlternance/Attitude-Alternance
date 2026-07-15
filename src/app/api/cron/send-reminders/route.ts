import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sendEmail";
import type { Application } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// Protège la route : seul Vercel Cron (qui envoie l'en-tête Authorization avec CRON_SECRET)
// peut déclencher cet envoi. Empêche un tiers d'appeler cette route librement.
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // pas de secret configuré = route désactivée par sécurité
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  // Toutes les candidatures dont la relance est due aujourd'hui ou en retard,
  // et qui ne sont pas déjà closes (acceptée ou refusée).
  const { data: applications, error } = await supabase
    .from("applications")
    .select("*")
    .not("next_followup_at", "is", null)
    .lte("next_followup_at", today)
    .not("status", "in", '("accepte","refus")');

  if (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération des candidatures." }, { status: 500 });
  }

  const apps = (applications ?? []) as Application[];
  if (apps.length === 0) {
    return NextResponse.json({ sent: 0, message: "Aucune relance due aujourd'hui." });
  }

  // Regroupe les candidatures par utilisateur
  const byUser = new Map<string, Application[]>();
  for (const app of apps) {
    const list = byUser.get(app.user_id) ?? [];
    list.push(app);
    byUser.set(app.user_id, list);
  }

  let sentCount = 0;

  for (const [userId, userApps] of byUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, first_name")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.email) continue;

    const itemsHtml = userApps
      .map((a) => `<li><strong>${escapeHtml(a.company)}</strong> — ${escapeHtml(a.role)}</li>`)
      .join("");

    const html = `
      <p>Bonjour ${escapeHtml(profile.first_name || "")},</p>
      <p>Vous avez ${userApps.length} candidature(s) à relancer aujourd'hui ou en retard sur Attitude Alternance :</p>
      <ul>${itemsHtml}</ul>
      <p>Connectez-vous à votre espace pour générer un message de relance en un clic.</p>
    `;

    const sent = await sendEmail({
      to: profile.email,
      subject: `${userApps.length} relance(s) à faire aujourd'hui — Attitude Alternance`,
      html,
    });

    if (sent) sentCount += 1;
  }

  return NextResponse.json({
    sent: sentCount,
    usersConcerned: byUser.size,
    activationEmailsSent: await sendActivationReminders(supabase),
  });
}

// Relance les comptes inscrits depuis au moins 2 jours qui n'ont encore ajouté
// aucune candidature — envoyée une seule fois par compte (jamais renvoyée ensuite).
async function sendActivationReminders(supabase: ReturnType<typeof createAdminClient>): Promise<number> {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const { data: inactiveProfiles } = await supabase
    .from("profiles")
    .select("id, email, first_name")
    .lte("created_at", twoDaysAgo.toISOString())
    .eq("total_applications_created", 0)
    .is("activation_reminder_sent_at", null);

  if (!inactiveProfiles || inactiveProfiles.length === 0) return 0;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://attitude-alternance.vercel.app";
  let sentCount = 0;

  for (const profile of inactiveProfiles) {
    if (!profile.email) continue;

    const html = `
      <p>Bonjour ${escapeHtml(profile.first_name || "")},</p>
      <p>Vous êtes inscrit(e) sur Attitude Alternance depuis quelques jours, mais vous n'avez pas encore ajouté de candidature.</p>
      <p>Ça ne prend que trente secondes : entreprise, poste, statut — et vous pourrez ensuite générer un message personnalisé et suivre vos relances automatiquement.</p>
      <p><a href="${siteUrl}/dashboard/applications">Ajouter ma première candidature</a></p>
    `;

    const sent = await sendEmail({
      to: profile.email,
      subject: "Ajoutez votre première candidature — Attitude Alternance",
      html,
    });

    if (sent) {
      sentCount += 1;
      await supabase
        .from("profiles")
        .update({ activation_reminder_sent_at: new Date().toISOString() })
        .eq("id", profile.id);
    }
  }

  return sentCount;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
