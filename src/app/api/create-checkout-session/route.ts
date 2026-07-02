import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json(
      { error: "L'abonnement Étudiant+ n'est pas encore configuré. Réessayez plus tard." },
      { status: 500 }
    );
  }

  const { origin } = new URL(request.url);

  try {
    const stripe = getStripe();

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userData.user.id)
      .maybeSingle();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: profile?.stripe_customer_id || undefined,
      customer_email: profile?.stripe_customer_id ? undefined : userData.user.email,
      client_reference_id: userData.user.id,
      success_url: `${origin}/dashboard/profile?upgraded=1`,
      cancel_url: `${origin}/dashboard/profile`,
      metadata: { supabase_user_id: userData.user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Erreur création session Stripe :", err);
    return NextResponse.json({ error: "Impossible de démarrer le paiement pour le moment." }, { status: 500 });
  }
}
