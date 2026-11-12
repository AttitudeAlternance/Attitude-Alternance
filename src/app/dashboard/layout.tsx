import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppNavbar, DesktopTopbar } from "@/components/layout/AppNavbar";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  // Le middleware (src/lib/supabase/middleware.ts) a déjà validé et rafraîchi la session
  // via un appel réseau à Supabase (auth.getUser()) avant que cette requête n'arrive ici.
  // On utilise donc getSession(), qui relit simplement le cookie déjà validé sans refaire
  // un aller-retour réseau — cela évite une double vérification à chaque changement de
  // rubrique du dashboard, qui ralentissait la navigation.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, plan, onboarding_dismissed_at")
    .eq("id", user?.id)
    .maybeSingle();
  const plan = (profile?.plan as "free" | "premium") ?? "free";
  return (
    <div className="min-h-screen bg-paper lg:flex">
      <aside className="hidden w-64 flex-shrink-0 border-r border-line bg-white lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar isAdmin={profile?.is_admin ?? false} plan={plan} />
        </div>
      </aside>
      <div className="flex-1">
        <AppNavbar email={user?.email} isAdmin={profile?.is_admin ?? false} plan={plan} />
        <DesktopTopbar email={user?.email} />
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
      <OnboardingTour
        userId={user?.id ?? ""}
        initialDismissed={Boolean(profile?.onboarding_dismissed_at)}
      />
    </div>
  );
}
