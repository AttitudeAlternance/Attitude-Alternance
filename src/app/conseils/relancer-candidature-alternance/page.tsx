import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/landing/CTAFooter";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Relancer une entreprise après une candidature alternance | Attitude Alternance",
  description:
    "Quand et comment relancer une entreprise après avoir postulé à une alternance : timing, canal, structure du message, et combien de fois relancer.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/85">{children}</div>
    </section>
  );
}

export default function FollowUpGuidePublicPage() {
  return (
    <main className="min-h-screen bg-paper">
      <PublicNavbar />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Link href="/conseils" className="text-sm font-medium text-primary hover:underline">
          ← Tous les conseils
        </Link>

        <div className="mb-8 mt-3">
          <h1 className="font-display text-3xl font-bold text-ink">Relancer une entreprise après une candidature</h1>
          <p className="mt-3 text-muted">
            L&apos;écrasante majorité des étudiants n&apos;envoie jamais de relance. C&apos;est justement ce qui en fait l&apos;un
            des leviers les plus sous-utilisés — et les plus efficaces — de la recherche d&apos;alternance.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
          <p className="text-sm leading-relaxed text-ink/85">
            L&apos;absence de réponse ne signifie presque jamais un refus. La plupart du temps, votre candidature est
            simplement noyée dans une boîte mail surchargée. Une relance bien faite ne dérange pas un recruteur — elle
            lui rappelle poliment que vous existez, au bon moment.
          </p>

          <Section title="🎯 Objectif">
            <p>
              Rester présent dans l&apos;esprit du recruteur sans jamais donner l&apos;impression d&apos;insister lourdement. Une
              bonne relance se lit en quinze secondes et laisse une impression positive, qu&apos;elle obtienne une
              réponse ou non.
            </p>
          </Section>

          <Section title="1. Pourquoi la relance change tout">
            <p>
              Postuler ne suffit pas : entre les candidatures perdues dans le flux, les recruteurs débordés et les
              périodes de forte affluence (mars à septembre pour l&apos;alternance), une candidature sans relance a
              statistiquement beaucoup moins de chances d&apos;obtenir une réponse qu&apos;une candidature relancée une fois.
            </p>
            <p>
              La relance est aussi un signal en soi : elle montre de la motivation et de la rigueur, deux qualités
              particulièrement recherchées chez un alternant.
            </p>
          </Section>

          <Section title="2. Quand relancer">
            <p>
              Le bon timing dépend du canal utilisé, mais une règle simple fonctionne dans la majorité des cas :
              <strong> une première relance environ 7 jours après l&apos;envoi</strong>, si vous n&apos;avez eu aucun retour
              (même un accusé de réception automatique ne compte pas comme une réponse).
            </p>
            <p>
              Trop tôt, vous risquez de paraître impatient. Trop tard, votre candidature a eu le temps de sortir
              complètement de la mémoire du recruteur.
            </p>
          </Section>

          <Section title="3. Quel canal utiliser">
            <p>
              L&apos;email reste le canal le plus sûr et le plus adapté dans la grande majorité des cas — c&apos;est un
              rappel discret qui ne dérange personne, et qui laisse une trace facile à retrouver pour le recruteur.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>LinkedIn</strong> peut être utilisé en complément, surtout si vous avez identifié la bonne
                personne (RH ou manager) et pas seulement une adresse générique.
              </li>
              <li>
                <strong>Le téléphone</strong> fonctionne bien pour des structures plus petites, où il est plus facile
                d&apos;avoir un interlocuteur direct — à éviter pour les grandes entreprises où vous tomberez rarement
                sur la bonne personne.
              </li>
            </ul>
          </Section>

          <Section title="4. Ce qu'un bon message de relance doit contenir">
            <p>Une relance efficace tient en quelques lignes et reprend toujours ces éléments :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>un rappel bref de votre candidature initiale (poste visé, date d&apos;envoi) ;</li>
              <li>une reformulation courte de votre motivation, sans tout répéter du premier message ;</li>
              <li>si possible, un élément nouveau ou complémentaire (une actualité de l&apos;entreprise, une précision sur votre disponibilité) ;</li>
              <li>une formule de politesse claire, sans mettre de pression sur le délai de réponse.</li>
            </ul>
            <p>
              Le ton doit rester léger et positif — jamais donner l&apos;impression de reprocher une absence de réponse.
            </p>
          </Section>

          <Section title="5. Combien de fois relancer">
            <p>
              Une à deux relances suffisent. Au-delà, le risque de paraître insistant dépasse le bénéfice potentiel.
              Si vous avez relancé deux fois sans aucun retour, il est temps de concentrer votre énergie ailleurs.
            </p>
          </Section>

          <Section title="6. Que faire face à un silence total">
            <p>
              C&apos;est fréquent, et ce n&apos;est pas toujours lié à la qualité de votre profil — parfois le poste a
              simplement été pourvu en interne, ou le recrutement a été mis en pause. Continuez à postuler ailleurs en
              parallèle plutôt que d&apos;attendre une seule réponse avant de relancer d&apos;autres pistes.
            </p>
          </Section>

          <Section title="🎓 Le conseil du coach">
            <p>
              La régularité compte plus que l&apos;intensité. Mieux vaut suivre méthodiquement une dizaine de
              candidatures actives, avec une relance planifiée pour chacune, que d&apos;envoyer cinquante candidatures
              sans jamais revenir vers personne.
            </p>
            <p>
              C&apos;est exactement ce que sert à faire un suivi structuré : ne jamais laisser une candidature « en
              silence » simplement parce qu&apos;on a oublié la date d&apos;envoi.
            </p>
          </Section>
        </div>

        <div className="mt-10 rounded-2xl bg-primary px-6 py-10 text-center shadow-pop sm:px-10">
          <h2 className="font-display text-xl font-bold text-white">
            Ne laissez plus aucune candidature sans suivi
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-primary-100/90">
            Attitude Alternance vous rappelle automatiquement quand relancer, et génère le message pour vous —
            gratuitement.
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
