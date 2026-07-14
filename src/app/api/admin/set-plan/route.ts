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

  const { userId, plan } = (await request.json()) as { userId?: string; plan?: "free" | "premium" };

  if (!userId || (plan !== "free" && plan !== "premium")) {
    return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ plan }).eq("id", userId);

  if (error) {
    return NextResponse.json({ error: "Impossible de mettre à jour le plan." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
