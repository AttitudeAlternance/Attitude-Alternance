import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

// Section "aperçu" de la landing page, renvoyant vers le guide illustré complet (/guide).
export function DemoVideo() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary-500">Comment ça marche</span>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
          Prenez en main le site en quelques minutes
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          Un guide illustré, étape par étape : créer son compte, déposer son CV, ajouter une candidature, générer un
          message, et suivre ses relances.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="relative aspect-video w-full">
          <Image
            src="/guide/06-dashboard.jpg"
            alt="Aperçu du tableau de bord Attitude Alternance"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
            <Link href="/guide">
              <Button size="lg" variant="secondary" className="border-transparent">
                📖 Voir le guide de démarrage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
