import { NextResponse } from "next/server";
import { geocodeCity } from "@/lib/geocode";
import { SECTOR_OPTIONS, sectorsToRomeCodes } from "@/lib/romeSecteurs";
import { searchAlternanceOffers } from "@/lib/labonnealternance";
import { sendEmail } from "@/lib/email/sendEmail";

export const runtime = "nodejs";
export const maxDuration = 60;

// Mail quotidien destiné à Baptiste lui-même (pas un étudiant) : il n'est donc rattaché à
// aucun profil ni aucune préférence enregistrée en base. Il faut malgré tout une ville et un
// rayon fixes, l'API La bonne alternance exigeant des coordonnées — choisis avec Baptiste le
// 20/08/2026 : Bordeaux, 60 km, tous les secteurs du site combinés. But : surveiller au jour le
// jour ce que le site remonte réellement (contrôle qualité), indépendamment de toute recherche
// étudiante.
const VILLE_DE_REFERENCE = "Bordeaux";
const RAYON_KM = 60;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  // Adresse de destination volontairement définie via une variable d'environnement (jamais en
  // dur dans le code source, qui se retrouve sur GitHub) : à ajouter dans Vercel sous le nom
  // OWNER_EMAIL. Sans cette variable, le mail n'est simplement pas envoyé (même logique de
  // dégradation silencieuse que sendEmail() pour RESEND_API_KEY/RESEND_FROM_EMAIL).
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    console.warn("OWNER_EMAIL non configurée : mail quotidien des nouvelles offres non envoyé.");
    return NextResponse.json({ sent: false, message: "OWNER_EMAIL non configurée." });
  }

  const geo = await geocodeCity(VILLE_DE_REFERENCE);
  if (!geo) {
    return NextResponse.json(
      { sent: false, message: `Ville "${VILLE_DE_REFERENCE}" introuvable via le géocodeur.` },
      { status: 500 }
    );
  }

  const romes = sectorsToRomeCodes(SECTOR_OPTIONS.map((s) => s.key));

  let offers;
  try {
    offers = await searchAlternanceOffers({
      latitude: geo.latitude,
      longitude: geo.longitude,
      radius: RAYON_KM,
      romes,
    });
  } catch (err) {
    console.error("Erreur lors de la recherche d'offres pour le mail quotidien du propriétaire :", err);
    return NextResponse.json({ sent: false, message: "Erreur lors de la recherche d'offres." }, { status: 500 });
  }

  // "Nouvelles offres du jour" = publiées dans les dernières 24h — même convention que le
  // mail d'alerte envoyé aux étudiants dans /api/cron/send-reminders. Les candidatures
  // spontanées suggérées (isSpontaneous) sont exclues : elles n'ont pas de date de
  // publication, ce ne sont pas de "nouvelles offres" au sens propre.
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const newOffers = offers.filter(
    (o) => !o.isSpontaneous && o.publicationDate && new Date(o.publicationDate) >= oneDayAgo
  );

  if (newOffers.length === 0) {
    return NextResponse.json({ sent: false, newOffersCount: 0, message: "Aucune nouvelle offre aujourd'hui." });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://attitude-alternance.fr";

  const listItems = newOffers
    .map(
      (o) =>
        `<li><strong>${escapeHtml(o.company)}</strong> — ${escapeHtml(o.title)}${
          o.city ? ` (${escapeHtml(o.city)})` : ""
        }</li>`
    )
    .join("");

  const html = `
    <p>Bonjour,</p>
    <p><strong>${newOffers.length} nouvelle${newOffers.length > 1 ? "s" : ""} offre${
    newOffers.length > 1 ? "s" : ""
  }</strong> d'alternance publiée${newOffers.length > 1 ? "s" : ""} dans les dernières 24h autour de
    ${escapeHtml(geo.label)} (${RAYON_KM} km, tous secteurs confondus) :</p>
    <ul>${listItems}</ul>
    <p><a href="${siteUrl}/dashboard/offers">Voir toutes les offres sur le site</a></p>
  `;

  const sent = await sendEmail({
    to: ownerEmail,
    subject: `${newOffers.length} nouvelle(s) offre(s) d'alternance aujourd'hui — Attitude Alternance`,
    html,
  });

  return NextResponse.json({ sent, newOffersCount: newOffers.length });
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
