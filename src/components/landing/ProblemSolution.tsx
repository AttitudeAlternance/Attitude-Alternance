const problems = [
  {
    title: "Des candidatures éparpillées",
    text: "Fichiers Excel, notes sur le téléphone, mails perdus : impossible de savoir qui relancer.",
  },
  {
    title: "Des relances oubliées",
    text: "Sans rappel, la moitié des candidatures reste sans suite faute d'un simple message.",
  },
  {
    title: "Des mails à rédiger from scratch",
    text: "Chaque mail de candidature ou de relance prend du temps et le ton est difficile à trouver.",
  },
];

export function ProblemSolution() {
  return (
    <section id="probleme" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-accent-600">Le problème</span>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            Chercher une alternance, c&apos;est un travail à temps plein.
          </h2>
          <ul className="mt-6 space-y-5">
            {problems.map((p) => (
              <li key={p.title} className="flex gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-danger" />
                <div>
                  <p className="text-sm font-semibold text-ink">{p.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-success">La solution</span>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            Un espace unique pour piloter toute votre recherche.
          </h2>
          <p className="mt-6 text-sm text-muted">
            Attitude Alternance regroupe le suivi de vos candidatures, la rédaction de vos messages et vos
            rappels de relance dans une seule interface, pensée pour aller plus vite sans rien oublier.
          </p>
          <div className="mt-6 rounded-2xl border border-line bg-primary-50 p-5">
            <p className="text-sm font-medium text-primary-600">
              Résultat : vous passez moins de temps à vous organiser, et plus de temps à candidater.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
