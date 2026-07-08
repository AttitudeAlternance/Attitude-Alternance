"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const supabase = createClient();

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
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-paper shadow-pop">
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
