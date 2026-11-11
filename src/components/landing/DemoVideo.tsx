import Link from "next/link";

// Section "aperçu" de la landing page : vidéo de démonstration du produit,
// avec un lien secondaire vers le guide illustré complet (/guide).
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
          <video
            src="/guide/demo-produit.mp4"
            poster="/guide/demo-produit-poster.jpg"
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            controls
          />
        </div>
      </div>

      <div className="mt-5 text-center">
        <Link
          href="/guide"
          className="text-sm font-semibold text-primary-500 underline-offset-4 hover:underline"
        >
          Voir le guide complet, étape par étape →
        </Link>
      </div>
    </section>
  );
}
