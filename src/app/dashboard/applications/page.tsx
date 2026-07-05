import { createClient } from "@/lib/supabase/server";
import { ApplicationsBoard } from "@/components/applications/ApplicationsBoard";
import { FREE_APPLICATIONS_LIMIT } from "@/lib/plan";
import type { Application } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ApplicationsPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userData.user?.id)
    .maybeSingle();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Mes candidatures</h1>
        <p className="mt-1 text-sm text-muted">
          Centralisez et suivez chaque candidature envoyée, de la prise de contact à la réponse finale.
        </p>
      </div>

      <ApplicationsBoard
        initialApplications={(applications ?? []) as Application[]}
        userId={userData.user?.id ?? ""}
        plan={(profile?.plan as "free" | "premium") ?? "free"}
        freeLimit={FREE_APPLICATIONS_LIMIT}
      />
    </div>
  );
}
