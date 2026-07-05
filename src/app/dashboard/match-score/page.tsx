import { createClient } from "@/lib/supabase/server";
import { MatchScoreTool } from "@/components/match-score/MatchScoreTool";
import type { Application, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MatchScorePage({
  searchParams,
}: {
  searchParams: { applicationId?: string };
}) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("cv_summary")
    .eq("id", userData.user?.id)
    .maybeSingle();

  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Score de correspondance</h1>
        <p className="mt-1 text-sm text-muted">
          Comparez votre CV à une offre pour évaluer vos chances et repérer ce qui manque avant de candidater.
        </p>
      </div>

      <MatchScoreTool
        cvSummary={(profile as Profile | null)?.cv_summary ?? null}
        applications={(applications ?? []) as Application[]}
        initialApplicationId={searchParams.applicationId ?? ""}
      />
    </div>
  );
}
