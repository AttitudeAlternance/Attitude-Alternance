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

  return NextResponse.json({ sent: sentCount, usersConcerned: byUser.size });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
