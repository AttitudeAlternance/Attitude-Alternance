import { createClient } from "@/lib/supabase/server";
import { OfferCheckTool } from "@/components/offer-check/OfferCheckTool";
import type { Application } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OfferCheckPage({
  searchParams,
}: {
  searchParams: { applicationId?: string };
}) {
  const supabase = createClient();
  await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Vérifier une offre</h1>
        <p className="mt-1 text-sm text-muted">
          Certaines écoles publient de fausses offres pour capter des candidats vers leurs formations. Collez un
          lien ou un texte d&apos;offre pour estimer le risque avant d&apos;y passer du temps.
        </p>
      </div>

      <OfferCheckTool applications={(applications ?? []) as Application[]} initialApplicationId={searchParams.applicationId ?? ""} />
    </div>
  );
}
