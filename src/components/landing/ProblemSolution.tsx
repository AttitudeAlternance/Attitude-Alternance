const problems = [
  {
    title: "Un outil différent pour chaque étape",
    text: "Un tableur pour le suivi, ChatGPT pour les messages, les job boards pour chercher, un pense-bête pour les relances : tout est éparpillé.",
  },
  {
    title: "Des offres qui passent à la trappe",
    text: "Entre LinkedIn, HelloWork et les autres, impossible de tout suivre — les bonnes offres se perdent dans l'onglet d'à côté.",
  },
  {
    title: "Des relances oubliées",
    text: "Sans rappel, la moitié des candidatures reste sans suite faute d'un simple message envoyé au bon moment.",
  },
];

const replaces = ["Un tableur Excel", "ChatGPT pour vos messages", "Les job boards", "Vos pense-bêtes de relance"];

export function ProblemSolution() {
  return (
    <section id="probleme" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-accent-600">Le problème</span>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            Chercher une alternance, c&apos;est un travail à temps plein — surtout avec dix outils différents.
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
            Un seul outil, du début à la fin de votre recherche.
          </h2>
          <p className="mt-6 text-sm text-muted">
            Attitude Alternance réunit la recherche d&apos;offres, le suivi de vos candidatures, la
            rédaction de vos messages et vos rappels de relance dans une seule interface — plus besoin
            de jongler entre plusieurs services pour une seule recherche.
          </p>
          <div className="mt-6 rounded-2xl border border-line bg-primary-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">Ça remplace</p>
            <ul className="mt-3 space-y-2">
              {replaces.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm font-medium text-primary-600">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
