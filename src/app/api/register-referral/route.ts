import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BONUS_PER_REFERRAL = 5;

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { code } = (await request.json()) as { code?: string };
  if (!code) {
    return NextResponse.json({ error: "Code de parrainage manquant." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Le nouvel utilisateur n'a pas encore réclamé de parrainage ?
  const { data: myProfile } = await admin
    .from("profiles")
    .select("referred_by")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (myProfile?.referred_by) {
    return NextResponse.json({ error: "Un parrainage a déjà été enregistré pour ce compte." }, { status: 409 });
  }

  const { data: referrer } = await admin
    .from("profiles")
    .select("id, bonus_applications")
    .eq("referral_code", code)
    .maybeSingle();

  if (!referrer) {
    return NextResponse.json({ error: "Code de parrainage invalide." }, { status: 404 });
  }

  if (referrer.id === userData.user.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas utiliser votre propre code." }, { status: 400 });
  }

  const { data: myCurrentProfile } = await admin
    .from("profiles")
    .select("bonus_applications")
    .eq("id", userData.user.id)
    .maybeSingle();

  await admin
    .from("profiles")
    .update({
      referred_by: referrer.id,
      bonus_applications: (myCurrentProfile?.bonus_applications ?? 0) + BONUS_PER_REFERRAL,
    })
    .eq("id", userData.user.id);

  await admin
    .from("profiles")
    .update({ bonus_applications: (referrer.bonus_applications ?? 0) + BONUS_PER_REFERRAL })
    .eq("id", referrer.id);

  return NextResponse.json({ success: true, bonus: BONUS_PER_REFERRAL });
}
