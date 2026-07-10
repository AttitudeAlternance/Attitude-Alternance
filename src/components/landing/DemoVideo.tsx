// Colle ici le lien "Embed" de ta vidéo Loom (ou YouTube) une fois enregistrée.
// Sur Loom : bouton "Share" → "Embed" → copie l'URL présente dans le src="..." de l'iframe fourni.
// Tant que ce champ reste vide, un emplacement d'attente propre s'affiche à la place.
const DEMO_VIDEO_EMBED_URL = "";

export function DemoVideo() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary-500">Démonstration</span>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
          Comprendre le site en moins de 2 minutes
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          Une vidéo courte pour voir concrètement comment ajouter une candidature, générer un message, et ne plus
          rien oublier.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        {DEMO_VIDEO_EMBED_URL ? (
          <div className="relative aspect-video w-full">
            <iframe
              src={DEMO_VIDEO_EMBED_URL}
              title="Démonstration Attitude Alternance"
              allow="fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-primary-50 px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7Z" />
              </svg>
            </span>
            <p className="text-sm font-medium text-primary-600">Vidéo de démonstration à venir</p>
          </div>
        )}
      </div>
    </section>
  );
}
