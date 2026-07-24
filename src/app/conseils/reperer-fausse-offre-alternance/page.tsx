import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/landing/CTAFooter";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Repérer une fausse offre d'alternance — Guide | Attitude Alternance",
  description:
    "Comment repérer une offre d'alternance fictive ou publiée par une école pour capter des candidats : signaux d'alerte et méthode de vérification.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/85">{children}</div>
    </section>
  );
}

export default function FakeOfferGuidePublicPage() {
  return (
    <main className="min-h-screen bg-paper">
      <PublicNavbar />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Link href="/conseils" className="text-sm font-medium text-primary hover:underline">
          ← Tous les conseils
        </Link>

        <div className="mb-8 mt-3">
          <h1 className="font-display text-3xl font-bold text-ink">Repérer une fausse offre d&apos;alternance</h1>
          <p className="mt-3 text-muted">
            Toutes les offres d&apos;alternance ne mènent pas à un vrai poste. Certaines servent surtout à récolter des
            candidatures pour remplir les effectifs d&apos;une formation.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
          <p className="text-sm leading-relaxed text-ink/85">
            La majorité des offres d&apos;alternance publiées en ligne sont légitimes. Mais certaines écoles ou
            organismes de formation publient volontairement des annonces qui ressemblent à de vraies offres
            d&apos;emploi, dans le seul but de récupérer des candidatures et de vous orienter ensuite vers une
            inscription payante — sans qu&apos;un vrai poste en entreprise n&apos;existe derrière.
          </p>

          <Section title="🎯 Objectif">
            <p>
              Ne pas perdre de temps et d&apos;énergie sur des candidatures qui ne mèneront jamais à un véritable
              entretien d&apos;embauche, et repérer rapidement les signaux d&apos;alerte avant de postuler.
            </p>
          </Section>

          <Section title="1. Pourquoi ce genre d'offre existe">
            <p>
              Le modèle économique de certains organismes de formation repose en partie sur le nombre d&apos;inscrits.
              Publier une offre d&apos;alternance très attractive, avec un intitulé de poste vague mais séduisant, est
              un moyen efficace de capter des candidats motivés — que l&apos;offre corresponde ou non à un poste réel.
            </p>
            <p>
              Ce n&apos;est pas systématique ni majoritaire, mais c&apos;est un phénomène suffisamment fréquent pour
              justifier une vérification rapide avant de postuler.
            </p>
          </Section>

          <Section title="2. Les signaux d'alerte à repérer">
            <ul className="list-disc space-y-1 pl-5">
              <li>L&apos;offre ne mentionne pas clairement le nom de l&apos;entreprise qui recrute, ou reste très vague sur son activité.</li>
              <li>La description du poste est générique et pourrait s&apos;appliquer à n&apos;importe quel métier.</li>
              <li>Le premier contact vous oriente vers une réunion d&apos;information sur une formation plutôt que vers un entretien avec un recruteur.</li>
              <li>La même annonce, quasiment identique, apparaît sous plusieurs noms d&apos;entreprises différents.</li>
              <li>On vous demande de vous inscrire à une formation avant même d&apos;avoir un entretien avec une entreprise.</li>
              <li>Les avantages proposés semblent disproportionnés par rapport au poste réellement décrit.</li>
            </ul>
          </Section>

          <Section title="3. Comment vérifier une offre avant de postuler">
            <p>Quelques vérifications rapides suffisent la plupart du temps :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Recherchez le nom de l&apos;entreprise en ligne : a-t-elle un site, une présence réelle, des avis ?</li>
              <li>Vérifiez si l&apos;entreprise existe légalement (numéro SIRET, immatriculation).</li>
              <li>Regardez qui vous répond réellement : un email personnel d&apos;un(e) recruteur(se) identifié(e) est bon signe ; une adresse générique de type contact@ecole-formation.fr l&apos;est moins.</li>
              <li>Comparez l&apos;offre avec d&apos;autres publiées par la même source : des intitulés très similaires, recyclés d&apos;une annonce à l&apos;autre, doivent alerter.</li>
            </ul>
          </Section>

          <Section title="4. Que faire en cas de doute">
            <p>
              Posez directement des questions précises : quel est le nom de l&apos;entreprise, qui sera votre
              tuteur/tutrice, à quelle adresse travaillerez-vous. Une offre légitime n&apos;aura aucun mal à y répondre
              clairement.
            </p>
            <p>
              Ne communiquez jamais d&apos;informations sensibles (pièce d&apos;identité, coordonnées bancaires) avant d&apos;avoir
              confirmé la légitimité de l&apos;offre. Et surtout, ne laissez jamais un doute vous empêcher de continuer à
              postuler ailleurs en parallèle.
            </p>
          </Section>

          <Section title="🎓 Le conseil du coach">
            <p>
              Une offre légitime peut toujours être vérifiée sereinement — une entreprise sérieuse n&apos;a rien à
              cacher sur son identité ou son activité. À l&apos;inverse, plus une réponse est évasive sur ces points
              simples, plus la prudence est de mise.
            </p>
            <p>
              Ce réflexe de vérification prend quelques minutes et peut vous éviter de perdre plusieurs semaines sur
              une piste qui ne mènera jamais à un vrai contrat.
            </p>
          </Section>
        </div>

        <div className="mt-10 rounded-2xl bg-primary px-6 py-10 text-center shadow-pop sm:px-10">
          <h2 className="font-display text-xl font-bold text-white">
            Un doute sur une offre ? Vérifiez-la en un clic
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-primary-100/90">
            Notre outil analyse le texte d&apos;une offre et repère les signaux d&apos;une annonce potentiellement
            trompeuse — gratuitement.
          </p>
          <Link href="/signup" className="mt-6 inline-block">
            <Button size="lg" variant="secondary" className="border-transparent">
              Créer mon compte gratuit
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
