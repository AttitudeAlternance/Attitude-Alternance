import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/PublicNavbar";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="rounded-2xl bg-primary px-6 py-14 text-center shadow-pop sm:px-12">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Prêt à structurer votre recherche d&apos;alternance ?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-primary-100/90">
          Créez votre compte gratuitement et ajoutez votre première candidature en moins de deux minutes.
        </p>
        <Link href="/signup" className="mt-7 inline-block">
          <Button size="lg" variant="secondary" className="border-transparent">
            Commencer
          </Button>
        </Link>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-sm font-semibold text-ink">AlternanceBoost</span>
        </div>
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} AlternanceBoost. Fait pour les étudiants en alternance.
        </p>
      </div>
    </footer>
  );
}
