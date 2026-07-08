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

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, plan, created_at, bonus_applications, referred_by");

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
  const estimatedMRR = premiumUsers * 5.99;

  const stats = [
    { label: "Étudiants inscrits", value: totalUsers },
    { label: "Nouveaux cette semaine", value: newThisWeek },
    { label: "Abonnés Étudiant+", value: premiumUsers },
    { label: "Comptes gratuits", value: freeUsers },
    { label: "Candidatures créées (total)", value: totalApplications ?? 0 },
    { label: "Messages générés (total)", value: totalMessages ?? 0 },
    { label: "Inscrits via parrainage", value: referredUsers },
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
    </div>
  );
}
