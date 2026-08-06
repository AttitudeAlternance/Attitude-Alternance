import { createClient } from "@/lib/supabase/server";
import { OfferSearch } from "@/components/offers/OfferSearch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OffersPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("target_city, target_sectors, search_radius")
    .eq("id", userData.user?.id)
    .maybeSingle();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Offres d&apos;alternance</h1>
        <p className="mt-1 text-sm text-muted">
          Offres issues de La bonne alternance (France Travail et ses partenaires), filtrées par
          localisation et secteur — ajoutez-les directement à votre suivi en un clic.
        </p>
      </div>

      <OfferSearch
        initialCity={profile?.target_city ?? ""}
        initialSectors={profile?.target_sectors ?? []}
        initialRadius={profile?.search_radius ?? 30}
      />
    </div>
  );
}
