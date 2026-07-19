"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/guide", label: "Guide" },
  { href: "/conseils", label: "Conseils" },
  { href: "/#fonctionnement", label: "Fonctionnement" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/#faq", label: "FAQ" },
];

export function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Referme le menu mobile à chaque changement de page.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Bloque le scroll de fond pendant que le menu mobile est ouvert.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-base font-semibold text-ink">Attitude Alternance</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/guide" className="text-sm text-muted hover:text-ink transition-colors">
            Guide
          </Link>
          <Link href="/conseils" className="text-sm text-muted hover:text-ink transition-colors">
            Conseils
          </Link>
          <a href="/#fonctionnement" className="text-sm text-muted hover:text-ink transition-colors">
            Fonctionnement
          </a>
          <a href="/#tarifs" className="text-sm text-muted hover:text-ink transition-colors">
            Tarifs
          </a>
          <a href="/#faq" className="text-sm text-muted hover:text-ink transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              Se connecter
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">
              Créer mon compte
            </Button>
          </Link>
          <button
            aria-label="Ouvrir le menu"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 text-ink hover:bg-black/5 md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-x-0 top-0 rounded-b-2xl bg-white p-4 shadow-pop">
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="font-display text-sm font-semibold text-ink">Menu</span>
              <button
                aria-label="Fermer le menu"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-2 text-ink/60 hover:bg-black/5 hover:text-ink"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav className="mt-3 flex flex-col gap-1">
              {navLinks.map((link) =>
                link.href.startsWith("/#") ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-primary-50 hover:text-primary-600"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-primary-50 hover:text-primary-600"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-primary-50 hover:text-primary-600 sm:hidden"
              >
                Se connecter
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export function Logo() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
      A
    </span>
  );
}
