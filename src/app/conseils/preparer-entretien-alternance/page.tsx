import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/landing/CTAFooter";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Préparer son entretien d'alternance — Guide complet | Attitude Alternance",
  description:
    "Le guide complet pour réussir son entretien d'alternance : maîtriser la fiche de poste, préparer sa présentation, connaître l'entreprise, anticiper les questions fréquentes.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/85">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-xl bg-paper/60 p-4">
      <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-2 space-y-2 text-sm text-ink/80">{children}</div>
    </div>
  );
}

export default function InterviewGuidePublicPage() {
  return (
    <main className="min-h-screen bg-paper">
      <PublicNavbar />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Link href="/conseils" className="text-sm font-medium text-primary hover:underline">
          ← Tous les conseils
        </Link>

        <div className="mb-8 mt-3">
          <h1 className="font-display text-3xl font-bold text-ink">Préparer son entretien d&apos;alternance</h1>
          <p className="mt-3 text-muted">
            Décrocher un entretien est une première victoire. L&apos;objectif n&apos;est plus de convaincre une entreprise
            de consulter votre CV, mais de lui démontrer que vous êtes la bonne personne pour le poste.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
          <p className="text-sm leading-relaxed text-ink/85">
            Contrairement aux idées reçues, un entretien ne s&apos;improvise pas. La majorité des étudiants pensent
            qu&apos;il suffit d&apos;être naturel. En réalité, les meilleurs entretiens sont souvent ceux qui ont été les
            mieux préparés — les candidats qui réussissent ont presque toujours préparé les mêmes éléments.
          </p>

          <Section title="🎯 Objectif">
            <p>
              Arriver le jour de l&apos;entretien avec suffisamment de confiance pour pouvoir échanger sereinement avec
              le recruteur. Plus vous aurez préparé votre entretien, moins vous serez concentré sur votre stress et
              plus vous serez capable de mettre en valeur votre parcours.
            </p>
          </Section>

          <Section title="1. Maîtriser la fiche de poste">
            <p>
              La fiche de poste est votre meilleur support de préparation. Avant l&apos;entretien, relisez-la plusieurs
              fois : vous devez être capable de citer les principales missions proposées sans avoir besoin de relire
              l&apos;annonce.
            </p>
            <p>Posez-vous les questions suivantes :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Quelles seront mes principales missions ?</li>
              <li>Quelles compétences recherche l&apos;entreprise ?</li>
              <li>Quels logiciels ou outils sont mentionnés ?</li>
              <li>Quelles qualités semblent importantes ?</li>
            </ul>
            <p>L&apos;objectif est de montrer au recruteur que vous avez compris ce qu&apos;il attend de son futur alternant.</p>
          </Section>

          <Section title="2. Préparer votre présentation">
            <p>
              La question « Pouvez-vous vous présenter ? » arrive dans la très grande majorité des entretiens. Votre
              présentation doit durer environ <strong>2 à 3 minutes</strong>, construite de manière chronologique :
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>votre parcours scolaire ;</li>
              <li>vos expériences professionnelles ;</li>
              <li>les compétences développées ;</li>
              <li>votre projet professionnel.</li>
            </ul>
            <p>
              Ne racontez pas simplement votre CV. Expliquez ce que chaque expérience vous a apporté et faites le lien
              avec le poste pour lequel vous postulez. À chaque expérience, demandez-vous :
            </p>
            <p className="rounded-lg bg-primary-50 px-4 py-3 font-medium text-primary-600">
              « En quoi cela peut-il rassurer le recruteur sur ma capacité à réussir dans ce poste ? »
            </p>
          </Section>

          <Section title="3. Bien connaître l'entreprise">
            <p>Avant chaque entretien, prenez le temps de faire quelques recherches. Vous devez connaître :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>son activité ;</li>
              <li>ses produits ou services ;</li>
              <li>ses principales valeurs ;</li>
              <li>son actualité récente ;</li>
              <li>ses réseaux sociaux.</li>
            </ul>
            <p>Selon le poste visé, adaptez votre préparation :</p>

            <SubSection title="Si vous postulez à un poste commercial">
              <p>Renseignez-vous sur : les clients de l&apos;entreprise, les produits vendus, la zone géographique, les concurrents.</p>
            </SubSection>

            <SubSection title="Si vous postulez à un poste en communication">
              <p>Analysez LinkedIn, Instagram, TikTok, Facebook et le site internet. Posez-vous des questions : la communication est-elle cohérente ? Quel type de contenu fonctionne le mieux ? Y a-t-il des pistes d&apos;amélioration ?</p>
            </SubSection>

            <p className="mt-3">Ces observations pourront être réutilisées pendant l&apos;entretien.</p>
          </Section>

          <Section title="4. Préparer les questions fréquentes">
            <p>Certaines questions reviennent presque systématiquement. Préparez vos réponses à l&apos;avance :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Présentez-vous.</li>
              <li>Pourquoi cette entreprise ?</li>
              <li>Pourquoi ce poste ?</li>
              <li>Pourquoi vous plutôt qu&apos;un autre candidat ?</li>
              <li>Quelles sont vos qualités ?</li>
              <li>Quels sont vos défauts ?</li>
              <li>Où vous voyez-vous dans quelques années ?</li>
            </ul>
            <p>L&apos;objectif n&apos;est pas d&apos;apprendre vos réponses par cœur, mais de réfléchir aux idées que vous souhaitez transmettre.</p>
          </Section>

          <Section title="5. Les qualités et les défauts">
            <p>Pour les qualités, choisissez des exemples concrets et expliquez comment elles vous ont aidé dans une expérience.</p>
            <p>
              Pour les défauts, évitez les réponses toutes faites. Choisissez un véritable axe d&apos;amélioration sur
              lequel vous travaillez déjà, et expliquez les actions mises en place pour progresser. Évitez surtout de
              citer un défaut qui pourrait être incompatible avec le poste.
            </p>
          </Section>

          <Section title="6. Préparer vos questions">
            <p>
              À la fin de l&apos;entretien, le recruteur vous demandera souvent : « Avez-vous des questions ? » Ne
              répondez jamais « Non. »
            </p>
            <p>Préparez quelques questions pertinentes :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Comment se déroule l&apos;intégration ?</li>
              <li>À quoi ressemble une semaine type ?</li>
              <li>Quelles seront les premières missions confiées ?</li>
              <li>Comment sera évaluée ma progression ?</li>
              <li>Avec qui travaillerai-je au quotidien ?</li>
            </ul>
            <p>Ces questions montrent votre intérêt pour le poste et votre capacité à vous projeter.</p>
          </Section>

          <Section title="🎓 Le conseil du coach">
            <p>Un bon entretien ne repose pas uniquement sur vos compétences. Il repose surtout sur votre capacité à rassurer le recruteur.</p>
            <p>À chaque réponse, posez-vous cette question :</p>
            <p className="rounded-lg bg-primary-50 px-4 py-3 font-medium text-primary-600">
              « Est-ce que ce que je viens de dire donne envie au recruteur de me confier ce poste ? »
            </p>
            <p>Si la réponse est oui, vous êtes sur la bonne voie.</p>
            <p>
              N&apos;oubliez jamais qu&apos;un recruteur ne cherche pas un candidat parfait. Il cherche une personne
              capable d&apos;apprendre, de s&apos;intégrer à son équipe et d&apos;avoir envie de réussir.
            </p>
            <p>
              Préparez votre entretien avec sérieux, mais restez vous-même. Une bonne préparation ne sert pas à réciter
              un discours, elle sert à gagner en confiance et à mettre en valeur ce que vous avez réellement à apporter.
            </p>
          </Section>
        </div>

        <div className="mt-10 rounded-2xl bg-primary px-6 py-10 text-center shadow-pop sm:px-10">
          <h2 className="font-display text-xl font-bold text-white">
            Envie d&apos;un accompagnement complet, pas juste des conseils ?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-primary-100/90">
            Suivez vos candidatures, générez vos messages avec l&apos;IA, et recevez vos rappels de relance — gratuitement.
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
