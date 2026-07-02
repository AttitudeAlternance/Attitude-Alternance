import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findEmail } from "@/lib/emailFinder";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json();
  const { domain, firstName, lastName } = body as { domain: string; firstName: string; lastName: string };

  if (!domain || !firstName || !lastName) {
    return NextResponse.json(
      { error: "Merci de renseigner le domaine de l'entreprise, le prénom et le nom du contact." },
      { status: 400 }
    );
  }

  const result = await findEmail({ domain, firstName, lastName });

  if (!result.best) {
    return NextResponse.json({ error: "Impossible de générer une adresse à partir de ces informations." }, { status: 422 });
  }

  return NextResponse.json(result);
}
