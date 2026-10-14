import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAndConsumeAiQuota } from "@/lib/aiUsage";

// Next.js doit exécuter cette route en environnement Node.js (pas Edge)
// car pdf-parse a besoin de l'API Buffer de Node.
export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4 Mo, cohérent avec les limites des fonctions Vercel

// Supabase Storage rejette les clés de fichier contenant des caractères accentués
// (é, è, à...) ou certains caractères spéciaux (apostrophes, parenthèses...), ce qui
// provoque une erreur "InvalidKey" à l'upload — indépendamment de la taille du fichier.
// Beaucoup de CV sont nommés avec des accents ou des espaces (ex: "CV_Camille_Été (final).pdf"),
// d'où l'intérêt d'assainir uniquement la clé de stockage ; le nom d'origine (fileName)
// reste inchangé partout ailleurs (affichage, etc.).
function sanitizeFileName(name: string): string {
  const withoutAccents = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const safe = withoutAccents.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
  // Garde une longueur raisonnable pour éviter les clés trop longues.
  return safe.slice(-150) || "cv.pdf";
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: userData, error: authError } = await supabase.auth.getUser();

    if (authError || !userData.user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const quota = await checkAndConsumeAiQuota(supabase, userData.user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: `Limite de ${quota.limit} analyses IA atteinte pour aujourd'hui. Réessayez demain, ou passez à Étudiant+ pour un quota plus élevé.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { fileBase64, fileName } = body as { fileBase64: string; fileName: string };

    if (!fileBase64 || !fileName) {
      return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
    }

    const buffer = Buffer.from(fileBase64, "base64");

    if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "Le fichier dépasse la taille maximale autorisée (4 Mo)." }, { status: 413 });
    }

    // --- 1. Extraction du texte du PDF ---
    // Import dynamique pour éviter que pdf-parse ne s'exécute au build/edge.
    const pdfParse = (await import("pdf-parse")).default;
    let extractedText = "";
    try {
      const parsed = await pdfParse(buffer);
      extractedText = parsed.text?.replace(/\s+/g, " ").trim() ?? "";
    } catch {
      return NextResponse.json(
        { error: "Impossible de lire ce PDF. Vérifiez qu'il n'est pas protégé ou corrompu." },
        { status: 422 }
      );
    }

    if (!extractedText || extractedText.length < 30) {
      return NextResponse.json(
        { error: "Aucun texte lisible trouvé dans ce PDF (peut-être un CV scanné en image)." },
        { status: 422 }
      );
    }

    // --- 2. Sauvegarde du fichier dans le stockage privé de l'utilisateur ---
    const storagePath = `${userData.user.id}/${Date.now()}-${sanitizeFileName(fileName)}`;
    const { error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(storagePath, buffer, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      // Le détail réel (ex: InvalidKey) part dans les logs Vercel pour faciliter
      // un futur diagnostic, sans exposer de détails techniques à l'utilisateur.
      console.error("Erreur upload CV vers Supabase Storage :", uploadError);
      return NextResponse.json({ error: "Erreur lors de l'enregistrement du fichier." }, { status: 500 });
    }

    // --- 3. Résumé du profil à partir du texte extrait ---
    const truncatedText = extractedText.slice(0, 12000); // garde une marge raisonnable pour l'IA et le stockage
    const { summary, usedRealAi } = await summarizeCv(truncatedText);

    // --- 4. Mise à jour du profil étudiant ---
    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({
        id: userData.user.id,
        cv_file_path: storagePath,
        cv_text: truncatedText,
        cv_summary: summary,
        cv_uploaded_at: new Date().toISOString(),
      });

    if (updateError) {
      return NextResponse.json({ error: "Erreur lors de l'enregistrement du profil." }, { status: 500 });
    }

    return NextResponse.json({ summary, usedRealAi });
  } catch (err) {
    return NextResponse.json({ error: "Erreur inattendue lors de l'analyse du CV." }, { status: 500 });
  }
}

// Résume le CV en un profil clair et exploitable par le générateur de messages.
// Utilise Claude si une clé API est configurée ; sinon un résumé simple par extraction.
async function summarizeCv(text: string): Promise<{ summary: string; usedRealAi: boolean }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 500,
          system:
            "Tu résumes des CV d'étudiants pour aider à personnaliser des candidatures d'alternance. " +
            "Rédige en français un résumé clair et structuré en 4 à 6 lignes maximum, sans phrases creuses : " +
            "formation actuelle, compétences ou outils clés, expériences/stages marquants, et point fort du profil. " +
            "Pas de titre, pas de liste à puces, juste un texte fluide et dense en information utile.",
          messages: [{ role: "user", content: `Voici le texte extrait d'un CV :\n"""\n${text}\n"""` }],
        }),
      });

      if (!response.ok) {
        // Diagnostic complet (statut + corps) pour identifier la vraie cause dans les logs
        // Vercel (clé invalide, quota dépassé, requête mal formée, panne Anthropic...).
        const errorBody = await response.text().catch(() => "");
        throw new Error(`Anthropic API error: ${response.status} — ${errorBody.slice(0, 500)}`);
      }

      const data = await response.json();
      const summary = data?.content?.find((block: { type: string }) => block.type === "text")?.text?.trim();
      if (summary) return { summary, usedRealAi: true };
    } catch (err) {
      console.error("Erreur résumé CV via Anthropic, repli sur extraction simple :", err);
    }
  }

  // Repli sans IA : on garde un extrait propre du texte brut, pas d'analyse réelle.
  const fallback = text.slice(0, 500).trim();
  return {
    summary: `${fallback}${text.length > 500 ? "…" : ""}\n\n(Résumé automatique simplifié — l'analyse IA n'a pas pu être utilisée cette fois-ci.)`,
    usedRealAi: false,
  };
}
