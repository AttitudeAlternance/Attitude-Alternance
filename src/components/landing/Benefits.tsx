const benefits = [
  {
    title: "CRM de candidatures",
    text: "Suivez chaque entreprise, chaque statut et chaque date de relance dans un tableau clair.",
    icon: TableIcon,
  },
  {
    title: "Messages générés par IA",
    text: "Mails de candidature, relances, messages LinkedIn : générés en quelques secondes, prêts à envoyer.",
    icon: SparkleIcon,
  },
  {
    title: "Relances jamais oubliées",
    text: "Les candidatures à relancer aujourd'hui ou en retard sont mises en évidence automatiquement.",
    icon: BellIcon,
  },
  {
    title: "Ressources pratiques",
    text: "Conseils CV, LinkedIn, entretien et méthode de relance, accessibles à tout moment.",
    icon: BookIcon,
  },
];

export function Benefits() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary-500">Bénéfices</span>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            Tout ce qu&apos;il faut pour avancer sereinement.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ title, text, icon: Icon }) => (
            <div key={title} className="rounded-2xl border border-line p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-sm font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TableIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M9 10v10" />
    </svg>
  );
}
function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M17.5 17.5 15 15M6 18l2.5-2.5M17.5 6.5 15 9" strokeLinecap="round" />
    </svg>
  );
}
function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M18 8a6 6 0 1 0-12 0c0 3-1 5-2 6h16c-1-1-2-3-2-6Z" />
      <path d="M9.5 20a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}
function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}
