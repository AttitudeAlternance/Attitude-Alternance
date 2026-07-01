const steps = [
  {
    n: "01",
    title: "Créez votre compte",
    text: "Inscription en 1 minute, sans engagement.",
  },
  {
    n: "02",
    title: "Ajoutez vos candidatures",
    text: "Renseignez les entreprises visées ou importez celles déjà envoyées.",
  },
  {
    n: "03",
    title: "Générez vos messages",
    text: "Laissez l'IA rédiger vos mails et messages LinkedIn selon le ton voulu.",
  },
  {
    n: "04",
    title: "Suivez vos relances",
    text: "Recevez un signal clair pour chaque relance à faire aujourd'hui ou en retard.",
  },
];

export function HowItWorks() {
  return (
    <section id="fonctionnement" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="max-w-xl">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary-500">Fonctionnement</span>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
          Quatre étapes pour structurer votre recherche.
        </h2>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <div key={step.n} className="relative rounded-2xl border border-line bg-white p-5">
            <span className="font-display text-3xl font-bold text-primary-100">{step.n}</span>
            <h3 className="mt-3 font-display text-sm font-semibold text-ink">{step.title}</h3>
            <p className="mt-1.5 text-sm text-muted">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
