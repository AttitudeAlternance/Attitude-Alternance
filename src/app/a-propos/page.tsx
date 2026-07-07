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
            Attitude Alternance a été conçu par un professionnel de l&apos;accompagnement à la recherche
            d&apos;alternance, qui observe chaque jour, sur le terrain, ce qui distingue réellement les candidatures
            qui aboutissent de celles qui restent sans réponse.
          </p>

          <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5">
            <p className="font-medium text-primary-600">
              Le constat est toujours le même : ce n&apos;est pas le nombre de candidatures envoyées qui fait la
              différence, c&apos;est la méthode derrière.
            </p>
          </div>

          <p>
            Un candidat qui suit rigoureusement chaque entreprise contactée, qui personnalise réellement ses
            messages en fonction du poste et de son profil, et qui relance au bon moment — ni trop tôt, ni trop
            tard — obtient objectivement plus d&apos;entretiens qu&apos;un candidat qui envoie beaucoup de
            candidatures de façon désorganisée.
          </p>

          <p>
            Cette rigueur méthodologique, les candidats accompagnés individuellement par un professionnel
            l&apos;acquièrent naturellement. Attitude Alternance a été créé pour la rendre accessible à tous les
            étudiants, avec ou sans accompagnement : un cadre structuré pour organiser sa recherche, personnaliser
            ses candidatures, et ne plus jamais laisser une relance passer à la trappe.
          </p>

          <p>
            L&apos;objectif reste simple : que chaque étudiant puisse candidater avec la même rigueur qu&apos;un
            candidat accompagné professionnellement, sans que ce soit réservé à ceux qui peuvent se l&apos;offrir.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
