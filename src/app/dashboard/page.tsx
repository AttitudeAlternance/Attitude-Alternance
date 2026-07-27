import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SprintHero } from "@/components/dashboard/SprintHero";
import { StartupChecklist } from "@/components/dashboard/StartupChecklist";
import { isOverdue, isDueToday, isThisWeek, computeStreak, getInitials, daysOverdue } from "@/lib/utils";
import type { Application } from "@/lib/types";

// Empêche la mise en cache de cette page : les statistiques doivent toujours
// refléter les dernières candidatures ajoutées, même juste après une modification.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const QUICK_LINKS = [
  { href: "/dashboard/messages", icon: "✨", label: "Générer un message" },
  { href: "/dashboard/match-score", icon: "🎯", label: "Score de correspondance" },
  { href: "/dashboard/offer-check", icon: "🛡️", label: "Vérifier une offre" },
  { href: "/dashboard/resources", icon: "📚", label: "Ressources" },
];

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

  const pending = apps.filter((a) => ["envoyee", "relance_a_faire"].includes(a.status)).length;
  const interviews = apps.filter((a) => a.status === "entretien_obtenu").length;
  const followupsDue = apps.filter(
    (a) => a.next_followup_at && (isDueToday(a.next_followup_at) || isOverdue(a.next_followup_at))
  );
  const thisWeekCount = apps.filter((a) => isThisWeek(a.applied_at ?? a.created_at)).length;
  const streak = computeStreak(apps.map((a) => a.created_at));

  const firstName = profile?.first_name || "";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">
          {firstName ? `Bonjour ${firstName} 👋` : "Bonjour 👋"}
        </h1>
        <p className="text-sm text-muted">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      <StartupChecklist
        hasCv={Boolean(profile?.cv_summary)}
        hasApplication={apps.length > 0}
        hasMessage={(messageCount ?? 0) > 0}
      />

      <SprintHero
        userId={userData.user?.id ?? ""}
        initialGoal={profile?.weekly_goal ?? 5}
        currentCount={thisWeekCount}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-medium text-muted">En attente de réponse</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{pending}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-muted">Entretiens obtenus</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{interviews}</p>
        </Card>
        <div className="rounded-2xl border border-accent-100 bg-accent-50 p-6 shadow-card">
          <p className="text-xs font-medium text-accent-600">Relances à faire</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{followupsDue.length}</p>
        </div>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted">🔥 {streak.current} jour{streak.current > 1 ? "s" : ""} d&apos;affilée</p>
            {streak.longest > 0 && <p className="text-[11px] text-muted">Record : {streak.longest}</p>}
          </div>
          <div className="mt-2.5 flex gap-1">
            {streak.weekDays.map((day, i) => (
              <div key={i} className="flex-1 text-center">
                <div
                  className={
                    day.active
                      ? "aspect-square w-full rounded-md bg-primary"
                      : day.isToday
                        ? "aspect-square w-full rounded-md border border-dashed border-primary-200 bg-primary-50"
                        : "aspect-square w-full rounded-md bg-line/60"
                  }
                />
                <p className={`mt-1 text-[10px] ${day.isToday ? "font-semibold text-ink" : "text-muted"}`}>
                  {day.label}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">À traiter aujourd&apos;hui</h2>
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
            <ul className="space-y-2">
              {followupsDue.slice(0, 5).map((app) => {
                const late = daysOverdue(app.next_followup_at);
                const dueToday = isDueToday(app.next_followup_at);
                const severe = late >= 7;
                return (
                  <li
                    key={app.id}
                    className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-2.5"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 font-display text-xs font-semibold text-primary">
                      {getInitials(app.company)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{app.company}</p>
                      <p className="truncate text-xs text-muted">{app.role}</p>
                    </div>
                    <span
                      className={
                        dueToday || !severe
                          ? "flex-shrink-0 rounded-full bg-warn-50 px-2.5 py-1 text-xs font-medium text-warn"
                          : "flex-shrink-0 rounded-full bg-danger-50 px-2.5 py-1 text-xs font-medium text-danger"
                      }
                    >
                      {dueToday ? "Aujourd'hui" : `${late}j de retard`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-base font-semibold text-ink">Accès rapide</h2>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col gap-2 rounded-xl border border-line px-3 py-3 transition-colors hover:border-primary-200 hover:bg-primary-50"
              >
                <span className="text-lg" aria-hidden="true">
                  {link.icon}
                </span>
                <span className="text-xs font-medium leading-snug text-ink">{link.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
