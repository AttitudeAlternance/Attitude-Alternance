import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { isThisWeek } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user?.id)
    .maybeSingle();

  if (!myProfile?.is_admin) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Accès restreint</h1>
        <p className="mt-2 text-sm text-muted">Cette page est réservée à l&apos;administrateur du site.</p>
      </div>
    );
  }

  // Vue globale multi-utilisateurs : nécessite le client admin (contourne les policies RLS,
  // volontairement, puisque c'est justement l'usage légitime de cette page).
  const admin = createAdminClient();

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, plan, created_at, bonus_applications, referred_by, waitlist_joined_at, age_range, target_sector, email, first_name, last_name")
    .order("created_at", { ascending: false });

  const { count: totalApplications } = await admin
    .from("applications")
    .select("*", { count: "exact", head: true });

  const { count: totalMessages } = await admin
    .from("generated_messages")
    .select("*", { count: "exact", head: true });

  const allProfiles = profiles ?? [];
  const totalUsers = allProfiles.length;
  const newThisWeek = allProfiles.filter((p) => isThisWeek(p.created_at)).length;
  const premiumUsers = allProfiles.filter((p) => p.plan === "premium").length;
  const freeUsers = totalUsers - premiumUsers;
  const referredUsers = allProfiles.filter((p) => p.referred_by).length;
  const waitlistCount = allProfiles.filter((p) => p.waitlist_joined_at).length;
  const estimatedMRR = premiumUsers * 5.99;

  const ageBreakdown = allProfiles.reduce<Record<string, number>>((acc, p) => {
    const key = p.age_range || "Non renseigné";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: "Étudiants inscrits", value: totalUsers },
    { label: "Nouveaux cette semaine", value: newThisWeek },
    { label: "Abonnés Étudiant+", value: premiumUsers },
    { label: "Comptes gratuits", value: freeUsers },
    { label: "Candidatures créées (total)", value: totalApplications ?? 0 },
    { label: "Messages générés (total)", value: totalMessages ?? 0 },
    { label: "Inscrits via parrainage", value: referredUsers },
    { label: "Sur liste d'attente Étudiant+", value: waitlistCount },
    { label: "MRR estimé", value: `${estimatedMRR.toFixed(2)}€` },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Admin</h1>
        <p className="mt-1 text-sm text-muted">
          Vue d&apos;ensemble de l&apos;activité du site. Pour le détail des paiements, consultez le{" "}
          <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            Dashboard Stripe
          </a>{" "}
          et le{" "}
          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            Dashboard Vercel Analytics
          </a>
          .
        </p>
      </div>

      {profilesError && (
        <p className="mb-4 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger">
          Erreur lors de la récupération des étudiants : {profilesError.message} (code : {profilesError.code})
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-xs font-medium text-muted">{stat.label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-ink">{stat.value}</p>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted">
        Le MRR (revenu récurrent mensuel) est une estimation basée sur {premiumUsers} abonné(s) à 5,99€ — le chiffre
        exact, avec les éventuels remboursements ou changements de tarif, reste celui affiché sur Stripe.
      </p>

      <Card className="mt-6">
        <h2 className="font-display text-base font-semibold text-ink">Répartition par tranche d&apos;âge</h2>
        <p className="mt-1 text-xs text-muted">
          Statistique agrégée et anonymisée (déclarative, facultative à l&apos;inscription) — utile pour un pitch
          commercial ou une présentation de l&apos;audience, sans exposer de donnée individuelle.
        </p>
        <div className="mt-4 space-y-2.5">
          {Object.entries(ageBreakdown)
            .sort((a, b) => b[1] - a[1])
            .map(([range, count]) => (
              <div key={range} className="flex items-center gap-3">
                <span className="w-32 flex-shrink-0 text-xs text-ink/80">{range}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${totalUsers > 0 ? (count / totalUsers) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-8 flex-shrink-0 text-right text-xs font-medium text-ink">{count}</span>
              </div>
            ))}
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="font-display text-base font-semibold text-ink">Étudiants inscrits</h2>
        <p className="mt-1 text-xs text-muted">
          Réservé à vous seul. Utile pour recontacter un étudiant, ou vérifier une inscription via parrainage.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-medium uppercase tracking-wide text-muted">
                <th className="py-2 pr-4">Nom</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Plan</th>
                <th className="py-2 pr-4">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {allProfiles.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 pr-4 text-ink/80">
                    {[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="py-2 pr-4 text-ink/80">{p.email || "—"}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={
                        p.plan === "premium"
                          ? "rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success"
                          : "rounded-full bg-paper px-2 py-0.5 text-xs font-medium text-muted"
                      }
                    >
                      {p.plan === "premium" ? "Étudiant+" : "Gratuit"}
                    </span>
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-muted">
                    {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
