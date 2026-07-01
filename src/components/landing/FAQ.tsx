"use client";

import { useState } from "react";

const faqs = [
  {
    q: "AlternanceBoost trouve-t-il des offres d'alternance à ma place ?",
    a: "Non : l'outil vous aide à organiser et accélérer votre recherche (suivi, messages, relances), mais ce sont vos candidatures que vous ajoutez et pilotez vous-même.",
  },
  {
    q: "Les messages générés par IA sont-ils personnalisés ?",
    a: "Oui, chaque message tient compte de l'entreprise, du poste, du recruteur si renseigné, du ton choisi et de vos informations personnelles.",
  },
  {
    q: "Puis-je utiliser AlternanceBoost sur mobile ?",
    a: "Oui, l'interface est entièrement responsive et fonctionne aussi bien sur ordinateur que sur smartphone.",
  },
  {
    q: "Mes données sont-elles partagées avec des tiers ?",
    a: "Non. Vos candidatures et informations personnelles sont strictement liées à votre compte et ne sont visibles que par vous.",
  },
  {
    q: "Puis-je annuler mon abonnement à tout moment ?",
    a: "Oui, l'abonnement Étudiant+ est sans engagement et peut être arrêté à tout moment depuis votre espace.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary-500">FAQ</span>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">Questions fréquentes</h2>
      </div>

      <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-white">
        {faqs.map((item, i) => (
          <div key={item.q} className="px-5">
            <button
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span className="text-sm font-medium text-ink">{item.q}</span>
              <svg
                className={`h-4 w-4 flex-shrink-0 text-muted transition-transform ${open === i ? "rotate-180" : ""}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {open === i && <p className="pb-4 text-sm text-muted">{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
