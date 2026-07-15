import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import { WeeklyGoalCard } from "@/components/dashboard/WeeklyGoalCard";
import { StartupChecklist } from "@/components/dashboard/StartupChecklist";
import { formatDate, isOverdue, isDueToday, isThisWeek } from "@/lib/utils";
import type { Application } from "@/lib/types";

// Empêche la mise en cache de cette page : les statistiques doivent toujours
// refléter les dernières candidatures ajoutées, même juste après une modification.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const [{ data: profile }, { data: applications }, { count: messageCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, weekly_goal, cv_summary")
      .eq("id", userData.user?.id)
      .maybeSingle(),
    supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("generated_messages")
      .select("*", { count: "exact", head: true }),
  ]);

  const apps = (applications ?? []) as Application[];

  const sent = apps.filter((a) => a.status !== "a_candidater").length;
  const pending = apps.filter((a) => ["envoyee", "relance_a_faire"].includes(a.status)).length;
  const interviews = apps.filter((a) => a.status === "entretien_obtenu").length;
  const followupsDue = apps.filter(
    (a) => a.next_followup_at && (isDueToday(a.next_followup_at) || isOverdue(a.next_followup_at))
  );
  const thisWeekCount = apps.filter((a) => isThisWeek(a.applied_at ?? a.created_at)).length;

  const stats = [
    { label: "Candidatures envoyées", value: sent },
    { label: "En attente de réponse", value: pending },
    { label: "Entretiens obtenus", value: interviews },
    { label: "Relances à faire", value: followupsDue.length },
  ];

  const firstName = profile?.first_name || "";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          {firstName ? `Bonjour ${firstName} 👋` : "Bonjour 👋"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Voici où en est votre recherche d&apos;alternance aujourd&apos;hui.
        </p>
      </div>

      <StartupChecklist
        hasCv={Boolean(profile?.cv_summary)}
        hasApplication={apps.length > 0}
        hasMessage={(messageCount ?? 0) > 0}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-xs font-medium text-muted">{stat.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-ink">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Relances à faire</h2>
            <Link href="/dashboard/applications" className="text-sm font-medium text-primary hover:underline">
              Voir tout
            </Link>
          </div>

          {followupsDue.length === 0 ? (
            <EmptyState
              title="Aucune relance en attente"
              description="Vous êtes à jour ! Les relances à faire apparaîtront ici automatiquement."
            />
          ) : (
            <ul className="space-y-2.5">
              {followupsDue.slice(0, 5).map((app) => (
                <li
                  key={app.id}
                  className="flex items-center justify-between rounded-xl border border-line px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{app.company}</p>
                    <p className="text-xs text-muted">{app.role}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${isOverdue(app.next_followup_at) ? "text-danger" : "text-warn"}`}>
                      {isOverdue(app.next_followup_at) ? "En retard" : "Aujourd'hui"} · {formatDate(app.next_followup_at)}
                    </p>
                    <StatusBadge status={app.status} className="mt-1" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-base font-semibold text-ink">Accès rapide</h2>
          <div className="mt-4 flex flex-col gap-2.5">
            <Link href="/dashboard/applications">
              <Button variant="secondary" className="w-full justify-start">
                + Ajouter une candidature
              </Button>
            </Link>
            <Link href="/dashboard/messages">
              <Button variant="secondary" className="w-full justify-start">
                ✦ Générer un message
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="secondary" className="w-full justify-start">
                Compléter mon profil
              </Button>
            </Link>
            <Link href="/dashboard/resources">
              <Button variant="secondary" className="w-full justify-start">
                Consulter les ressources
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <WeeklyGoalCard
        userId={userData.user?.id ?? ""}
        initialGoal={profile?.weekly_goal ?? 5}
        currentCount={thisWeekCount}
      />
    </div>
  );
}
