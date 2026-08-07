import { createClient } from "@/lib/supabase/server";
import { InterviewPrepGenerator } from "@/components/interview-prep/InterviewPrepGenerator";
import type { Application, Profile } from "@/lib/types";

export default async function InterviewPrepPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const [{ data: profile }, { data: applications }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userData.user?.id).maybeSingle(),
    supabase.from("applications").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Préparation d&apos;entretien</h1>
        <p className="mt-1 text-sm text-muted">
          Synthèse de l&apos;annonce, pitch personnalisé, questions probables — pour arriver prêt(e), en
          quelques secondes.
        </p>
      </div>

      <InterviewPrepGenerator profile={profile as Profile | null} applications={(applications ?? []) as Application[]} />
    </div>
  );
}
