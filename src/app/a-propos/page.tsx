import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/landing/CTAFooter";

export const metadata = {
  title: "À propos — Attitude Alternance",
  description: "Qui est derrière Attitude Alternance et pourquoi ce site a été créé.",
};

export default function AProposPage() {
  return (
    <main className="min-h-screen bg-paper">
      <PublicNavbar />
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-ink">À propos</h1>

        <div className="mt-8 space-y-5 text-sm leading-relaxed text-ink/85">
          <p>
            [À PERSONNALISER] Bonjour, je m&apos;appelle [votre prénom]. J&apos;accompagne au quotidien des étudiants
            dans leur recherche d&apos;alternance dans le cadre de mon activité professionnelle, et j&apos;ai créé
            Attitude Alternance pour leur donner un outil simple qui centralise ce que je leur recommande déjà à
            l&apos;oral : suivre chaque candidature sérieusement, relancer au bon moment, et écrire des messages qui
            montrent une vraie compréhension du poste visé.
          </p>
          <p>
            Ce site n&apos;est pas un énième CRM générique : chaque fonctionnalité part d&apos;un vrai problème que j&apos;ai
            observé chez les étudiants que j&apos;accompagne — des candidatures perdues dans un carnet, des relances
            oubliées, des messages trop génériques, ou du temps perdu sur de fausses offres publiées par des écoles.
          </p>
          <p>
            L&apos;objectif reste simple : que vous passiez moins de temps à vous organiser, et plus de temps à
            candidater efficacement.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
