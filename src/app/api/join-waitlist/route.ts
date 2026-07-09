import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ waitlist_joined_at: new Date().toISOString() })
    .eq("id", userData.user.id);

  if (error) {
    return NextResponse.json({ error: "Impossible de vous inscrire sur la liste d'attente." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
