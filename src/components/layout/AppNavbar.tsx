"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Sidebar } from "@/components/layout/Sidebar";

interface AppNavbarProps {
  email?: string | null;
  isAdmin?: boolean;
}

export function AppNavbar({ email, isAdmin }: AppNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // Filet de sécurité : quel que soit le chemin emprunté pour naviguer (lien du menu,
  // bouton précédent/suivant du téléphone, etc.), le menu mobile se referme dès que
  // l'URL change. Ça évite qu'il reste affiché par-dessus la nouvelle page.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Empêche la page de défiler derrière le menu quand celui-ci est ouvert sur mobile.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:hidden">
      <button
        aria-label="Ouvrir le menu"
        onClick={() => setMenuOpen(true)}
        className="rounded-lg p-2 text-ink hover:bg-black/5"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      <span className="font-display text-sm font-semibold text-ink">Attitude Alternance</span>

      <Button variant="ghost" size="sm" onClick={handleLogout}>
        Déconnexion
      </Button>

      {menuOpen && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-paper shadow-pop">
            <button
              aria-label="Fermer le menu"
              onClick={() => setMenuOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-2 text-ink/60 hover:bg-black/5 hover:text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
            <Sidebar onNavigate={() => setMenuOpen(false)} isAdmin={isAdmin} />
          </div>
        </div>
      )}
    </header>
  );
}

export function DesktopTopbar({ email }: AppNavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="hidden h-16 items-center justify-end gap-4 border-b border-line bg-white/60 px-6 lg:flex">
      {email && <span className="text-sm text-muted">{email}</span>}
      <Button variant="secondary" size="sm" onClick={handleLogout}>
        Déconnexion
      </Button>
    </div>
  );
}
