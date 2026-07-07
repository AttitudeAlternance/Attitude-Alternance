import Link from "next/link";
import { Button } from "@/components/ui/Button";

const pipeline = [
  { label: "À candidater", tone: "bg-slate-200 text-slate-600" },
  { label: "Envoyée", tone: "bg-primary-100 text-primary-600" },
  { label: "Relance faite", tone: "bg-warn-50 text-warn-500" },
  { label: "Entretien", tone: "bg-accent-100 text-accent-600" },
  { label: "Accepté", tone: "bg-success-50 text-success-500" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-16 pb-20 sm:px-6 md:grid-cols-2 md:items-center md:pt-24">
        <div>
          <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
            Pensé pour les étudiants en recherche d&apos;alternance
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-ink sm:text-5xl">
            Trouvez votre alternance plus vite, sans perdre le fil.
          </h1>
          <p className="mt-4 max-w-md text-base font-medium text-primary-600 sm:text-lg">
            L&apos;assistant qui centralise vos candidatures, personnalise vos messages, et repère les pièges avant vous.
          </p>
          <p className="mt-3 max-w-md text-base text-muted sm:text-lg">
            Attitude Alternance centralise vos candidatures, rédige vos mails avec l&apos;IA
            et vous rappelle qui relancer, au bon moment.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup">
              <Button size="lg">Commencer gratuitement</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Accéder à mon espace
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted">Aucune carte bancaire requise pour démarrer.</p>
        </div>

        {/* Élément signature : le pipeline de candidature, identique à celui du CRM */}
        <div className="relative">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-pop">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-sm font-semibold text-ink">Suivi en direct</span>
              <span className="text-xs text-muted">7 candidatures actives</span>
            </div>
            <ol className="space-y-3">
              {[
                { company: "Lumeo Digital", role: "Chargé(e) de marketing", step: 1 },
                { company: "Nova Consulting", role: "Assistant(e) RH", step: 2 },
                { company: "Ateliers Verdant", role: "Développeur(se) web", step: 3 },
                { company: "Cabinet Ferrand", role: "Assistant(e) comptable", step: 4 },
              ].map((item) => (
                <li
                  key={item.company}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line/70 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{item.company}</p>
                    <p className="text-xs text-muted">{item.role}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${pipeline[item.step].tone}`}>
                    {pipeline[item.step].label}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex items-center gap-1.5">
              {pipeline.map((step, i) => (
                <div key={step.label} className="flex flex-1 items-center gap-1.5">
                  <div className={`h-1.5 flex-1 rounded-full ${i <= 3 ? "bg-primary" : "bg-line"}`} />
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted">À candidater → Envoyée → Relance → Entretien → Accepté</p>
          </div>
        </div>
      </div>
    </section>
  );
}
