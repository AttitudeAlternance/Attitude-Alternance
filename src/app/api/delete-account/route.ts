import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Supprime définitivement le compte de l'utilisateur connecté et toutes ses données.
 *
 * La suppression de la ligne auth.users entraîne automatiquement (via les contraintes
 * "on delete cascade" définies dans le schéma) la suppression du profil, des candidatures
 * et des messages générés. Les fichiers de CV, stockés séparément dans Supabase Storage,
 * sont supprimés explicitement avant la suppression du compte.
 */
export async function POST() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const userId = userData.user.id;
  const admin = createAdminClient();

  try {
    const { data: files } = await admin.storage.from("cvs").list(userId);
    if (files && files.length > 0) {
      const paths = files.map((f) => `${userId}/${f.name}`);
      await admin.storage.from("cvs").remove(paths);
    }
  } catch (err) {
    console.error("Erreur lors de la suppression des fichiers CV :", err);
    // On continue malgré tout : mieux vaut supprimer le compte qu'échouer sur un fichier orphelin.
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);

  if (deleteError) {
    console.error("Erreur lors de la suppression du compte :", deleteError);
    return NextResponse.json({ error: "Impossible de supprimer le compte pour le moment." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
