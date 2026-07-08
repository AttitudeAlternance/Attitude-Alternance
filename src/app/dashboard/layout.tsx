import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppNavbar, DesktopTopbar } from "@/components/layout/AppNavbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", data.user?.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-paper lg:flex">
      {/* Sidebar fixe sur desktop */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-line bg-white lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar isAdmin={profile?.is_admin ?? false} />
        </div>
      </aside>

      <div className="flex-1">
        <AppNavbar email={data.user?.email} isAdmin={profile?.is_admin ?? false} />
        <DesktopTopbar email={data.user?.email} />
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
