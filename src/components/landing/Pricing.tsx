import Link from "next/link";
import { Button } from "@/components/ui/Button";

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    period: "",
    description: "Pour démarrer sa recherche sereinement.",
    features: ["Jusqu'à 15 candidatures suivies", "Générateur de messages (placeholder)", "Rappels de relance", "Accès aux ressources"],
    cta: "Créer mon compte",
    highlighted: false,
  },
  {
    name: "Étudiant+",
    price: "5,99€",
    period: "/mois",
    description: "Pour une recherche intensive, sans limite.",
    features: [
      "Candidatures illimitées",
      "Générateur de messages IA avancé",
      "Historique complet des messages",
      "Support prioritaire par email",
    ],
    cta: "Essayer Étudiant+",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section id="tarifs" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary-500">Tarifs</span>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            Un tarif simple, pensé pour un budget étudiant.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 max-w-3xl">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 ${
                plan.highlighted ? "border-primary bg-primary-50 shadow-pop" : "border-line"
              }`}
            >
              <h3 className="font-display text-base font-semibold text-ink">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted">{plan.description}</p>
              <p className="mt-4 font-display text-3xl font-bold text-ink">
                {plan.price}
                <span className="text-sm font-medium text-muted">{plan.period}</span>
              </p>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink/80">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-6 block">
                <Button variant={plan.highlighted ? "primary" : "secondary"} className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
