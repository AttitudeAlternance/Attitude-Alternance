import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sendEmail";
import { geocodeCity } from "@/lib/geocode";
import { sectorsToRomeCodes } from "@/lib/romeSecteurs";
import { searchAlternanceOffers } from "@/lib/labonnealternance";
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://attitude-alternance.fr";

  // 1) Toutes les candidatures dont la relance est due aujourd'hui ou en retard,
  // et qui ne sont pas déjà closes (acceptée ou refusée). Les candidatures encore
  // "à candidater" restent volontairement incluses : si l'étudiant a oublié de
  // postuler, le rappel lui sert justement de piqûre de rappel pour le faire.
  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .not("next_followup_at", "is", null)
    .lte("next_followup_at", today)
    .not("status", "in", '("accepte","refus")');

  const apps = (applications ?? []) as Application[];
  const appsByUser = new Map<string, Application[]>();
  for (const app of apps) {
    const list = appsByUser.get(app.user_id) ?? [];
    list.push(app);
    appsByUser.set(app.user_id, list);
  }

  // 2) Étudiants ayant paramétré une recherche d'offres (ville + au moins un secteur) : on
  // relance la même recherche que sur /dashboard/offers, et on ne retient que les offres
  // publiées dans les dernières 24h — pas la peine de recompter les mêmes offres chaque jour.
  const { data: searchProfiles } = await supabase
    .from("profiles")
    .select("id, target_city, target_sectors, search_radius")
    .not("target_city", "is", null);

  const newOffersByUser = new Map<string, { count: number; examples: { title: string; company: string }[] }>();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  for (const profile of searchProfiles ?? []) {
    const sectors = (profile.target_sectors ?? []) as string[];
    if (!profile.target_city || sectors.length === 0) continue;

    const romes = sectorsToRomeCodes(sectors);
    if (romes.length === 0) continue;

    try {
      const geo = await geocodeCity(profile.target_city);
      if (!geo) continue;

      const offers = await searchAlternanceOffers({
        latitude: geo.latitude,
        longitude: geo.longitude,
        radius: profile.search_radius ?? 30,
        romes,
      });

      const recent = offers.filter(
        (o) => !o.isSpontaneous && o.publicationDate && new Date(o.publicationDate) >= oneDayAgo
      );

      if (recent.length > 0) {
        newOffersByUser.set(profile.id, {
          count: recent.length,
          examples: recent.slice(0, 3).map((o) => ({ title: o.title, company: o.company })),
        });
      }
    } catch (err) {
      // Un échec de recherche pour un étudiant ne doit pas empêcher l'envoi des emails
      // des autres — on log et on continue.
      console.error(`Erreur recherche d'offres pour le profil ${profile.id}:`, err);
    }

    // Petite pause entre chaque appel, par égard pour le quota de l'API (60 appels/minute).
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // 3) Union des étudiants ayant au moins une raison de recevoir un email aujourd'hui.
  const userIds = new Set<string>([...appsByUser.keys(), ...newOffersByUser.keys()]);
  if (userIds.size === 0) {
    return NextResponse.json({ sent: 0, message: "Rien à envoyer aujourd'hui." });
  }

  let sentCount = 0;

  for (const userId of userIds) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, first_name")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.email) continue;

    const userApps = appsByUser.get(userId) ?? [];
    const toSend = userApps.filter((a) => a.status === "a_candidater");
    const toFollowUp = userApps.filter((a) => a.status !== "a_candidater");
    const offersInfo = newOffersByUser.get(userId);

    const listItem = (a: Application) => `<li><strong>${escapeHtml(a.company)}</strong> — ${escapeHtml(a.role)}</li>`;

    const toSendBlock =
      toSend.length > 0
        ? `<p>À envoyer aujourd'hui (repérée mais pas encore postulée) :</p><ul>${toSend
            .map(listItem)
            .join("")}</ul>`
        : "";

    const toFollowUpBlock =
      toFollowUp.length > 0
        ? `<p>À relancer aujourd'hui ou en retard :</p><ul>${toFollowUp.map(listItem).join("")}</ul>`
        : "";

    const offersBlock = offersInfo
      ? `<p><strong>${offersInfo.count} nouvelle${offersInfo.count > 1 ? "s" : ""} offre${
          offersInfo.count > 1 ? "s" : ""
        }</strong> correspondant à votre recherche, publiée${offersInfo.count > 1 ? "s" : ""} depuis hier :</p><ul>${offersInfo.examples
          .map((o) => `<li><strong>${escapeHtml(o.company)}</strong> — ${escapeHtml(o.title)}</li>`)
          .join("")}</ul><p><a href="${siteUrl}/dashboard/offers">Voir toutes les offres</a></p>`
      : "";

    const html = `
      <p>Bonjour ${escapeHtml(profile.first_name || "")},</p>
      <p>Un point sur votre recherche d'alternance sur Attitude Alternance :</p>
      ${toSendBlock}
      ${toFollowUpBlock}
      ${offersBlock}
      <p>Connectez-vous à votre espace pour en savoir plus.</p>
    `;

    const subjectParts: string[] = [];
    if (toFollowUp.length > 0) subjectParts.push(`${toFollowUp.length} relance(s)`);
    if (toSend.length > 0) subjectParts.push(`${toSend.length} candidature(s) à envoyer`);
    if (offersInfo) subjectParts.push(`${offersInfo.count} nouvelle(s) offre(s)`);

    const sent = await sendEmail({
      to: profile.email,
      subject: `${subjectParts.join(", ")} — Attitude Alternance`,
      html,
    });

    if (sent) sentCount += 1;
  }

  return NextResponse.json({
    sent: sentCount,
    usersConcerned: userIds.size,
    usersWithNewOffers: newOffersByUser.size,
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://attitude-alternance.fr";
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
