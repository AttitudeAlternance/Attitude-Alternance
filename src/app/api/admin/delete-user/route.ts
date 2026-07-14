import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const { userId } = (await request.json()) as { userId?: string };

  if (!userId) {
    return NextResponse.json({ error: "Identifiant manquant." }, { status: 400 });
  }

  if (userId === userData.user.id) {
    return NextResponse.json({ error: "Impossible de supprimer votre propre compte administrateur ici." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Supprime le CV stocké (le cas échéant) avant de supprimer le compte.
  try {
    const { data: files } = await admin.storage.from("cvs").list(userId);
    if (files && files.length > 0) {
      const paths = files.map((f) => `${userId}/${f.name}`);
      await admin.storage.from("cvs").remove(paths);
    }
  } catch (err) {
    console.error("Erreur lors de la suppression des fichiers CV :", err);
  }

  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: "Impossible de supprimer ce compte." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
