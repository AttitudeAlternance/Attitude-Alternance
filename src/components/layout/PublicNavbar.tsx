import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function PublicNavbar() {
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
          <a href="#fonctionnement" className="text-sm text-muted hover:text-ink transition-colors">
            Fonctionnement
          </a>
          <a href="#tarifs" className="text-sm text-muted hover:text-ink transition-colors">
            Tarifs
          </a>
          <a href="#faq" className="text-sm text-muted hover:text-ink transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Se connecter
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">
              Créer mon compte
            </Button>
          </Link>
        </div>
      </div>
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
