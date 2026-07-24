import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/landing/CTAFooter";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Rédiger son CV alternance — Guide complet | Attitude Alternance",
  description:
    "Le guide complet pour construire un CV alternance efficace : structure, formation, expériences, compétences à mettre en avant, erreurs à éviter.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/85">{children}</div>
    </section>
  );
}

export default function CvGuidePublicPage() {
  return (
    <main className="min-h-screen bg-paper">
      <PublicNavbar />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Link href="/conseils" className="text-sm font-medium text-primary hover:underline">
          ← Tous les conseils
        </Link>

        <div className="mb-8 mt-3">
          <h1 className="font-display text-3xl font-bold text-ink">Rédiger son CV pour une alternance</h1>
          <p className="mt-3 text-muted">
            Un recruteur passe en moyenne moins de 30 secondes sur un premier CV. L&apos;objectif n&apos;est pas d&apos;être
            exhaustif, c&apos;est de donner envie de vous rencontrer.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
          <p className="text-sm leading-relaxed text-ink/85">
            Beaucoup d&apos;étudiants pensent qu&apos;un bon CV doit tout dire. C&apos;est l&apos;inverse : un bon CV alternance
            tient sur une page, va droit au but, et met en avant ce qui rassure un recruteur sur votre capacité à
            occuper le poste — même sans grande expérience professionnelle.
          </p>

          <Section title="🎯 Objectif">
            <p>
              Décrocher un entretien, pas un emploi. Le CV n&apos;a qu&apos;un seul rôle : convaincre un recruteur de vous
              rencontrer. Tout ce qui n&apos;y contribue pas directement peut être retiré.
            </p>
          </Section>

          <Section title="1. La structure qui fonctionne">
            <p>Dans cet ordre, sur une seule page :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Coordonnées et titre (ex : « Étudiant BTS NDRC — Recherche alternance Commerce »)</li>
              <li>Formation en cours et rythme d&apos;alternance</li>
              <li>Expériences (stages, jobs étudiants, alternance précédente)</li>
              <li>Compétences (outils, langues, logiciels)</li>
              <li>Centres d&apos;intérêt, seulement s&apos;ils apportent une information utile</li>
            </ul>
            <p>
              Un CV de deux pages pour un profil étudiant envoie souvent le mauvais signal : qu&apos;on ne sait pas encore
              distinguer l&apos;essentiel de l&apos;accessoire.
            </p>
          </Section>

          <Section title="2. Bien présenter sa formation">
            <p>Indiquez clairement :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>le diplôme préparé et l&apos;établissement ;</li>
              <li>le rythme d&apos;alternance recherché (ex : 3 jours entreprise / 2 jours école, ou par semaines) ;</li>
              <li>la date de début souhaitée et la durée du contrat.</li>
            </ul>
            <p>
              Le rythme d&apos;alternance est une information que beaucoup d&apos;étudiants oublient — c&apos;est pourtant
              souvent la première question que se pose un recruteur pour savoir si votre profil correspond à son
              organisation.
            </p>
          </Section>

          <Section title="3. Valoriser ses expériences, même sans expérience professionnelle">
            <p>
              Un stage de deux semaines, un job d&apos;été, un projet scolaire en groupe ou un engagement associatif sont
              tous des expériences valorisables — à condition de les reformuler en compétences transférables plutôt
              qu&apos;en simple description de tâches.
            </p>
            <p>Plutôt que d&apos;écrire une liste de missions, essayez de répondre à la question : « qu&apos;ai-je appris,
              et qu&apos;est-ce que ça prouve ? » Quand c&apos;est possible, chiffrez :
            </p>
            <p className="rounded-lg bg-primary-50 px-4 py-3 font-medium text-primary-600">
              « Vente en boutique, job d&apos;été » devient « Accueil et conseil client, contribution à une hausse de
              15% du panier moyen sur la période estivale »
            </p>
          </Section>

          <Section title="4. Les compétences à mettre en avant">
            <p>Priorisez les compétences directement utiles au poste visé, pas une liste générique :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>outils et logiciels maîtrisés (Excel, CRM, Photoshop, langages de code...) ;</li>
              <li>niveau de langue, si pertinent pour le poste ;</li>
              <li>permis B, si utile à l&apos;activité.</li>
            </ul>
            <p>
              Évitez les qualités listées sans preuve (« rigoureux », « autonome », « dynamique »). Elles sont plus
              convaincantes racontées dans une expérience que citées seules dans une liste.
            </p>
          </Section>

          <Section title="5. Erreurs à éviter">
            <ul className="list-disc space-y-1 pl-5">
              <li>Un CV de plus d&apos;une page pour un profil étudiant.</li>
              <li>Une adresse email peu professionnelle (préférez prénom.nom@... à un pseudo).</li>
              <li>Des fautes d&apos;orthographe — faites relire par une tierce personne avant tout envoi.</li>
              <li>Un objectif de carrière vague ou copié-collé d&apos;un modèle trouvé en ligne.</li>
              <li>De gros blocs de texte difficiles à scanner rapidement.</li>
            </ul>
          </Section>

          <Section title="6. Format et présentation">
            <p>
              Exportez toujours votre CV en PDF, jamais en Word — la mise en page peut se casser en fonction du
              logiciel du destinataire. Nommez le fichier clairement, par exemple{" "}
              <span className="rounded bg-paper px-1.5 py-0.5 font-mono text-xs">CV_Prenom_Nom_Alternance.pdf</span>{" "}
              plutôt que <span className="rounded bg-paper px-1.5 py-0.5 font-mono text-xs">document.pdf</span> — un
              recruteur reçoit parfois des dizaines de CV du même nom générique dans le même dossier.
            </p>
            <p>
              Sur la forme : privilégiez une mise en page sobre et lisible plutôt qu&apos;un design trop chargé. La
              clarté prime toujours sur l&apos;originalité visuelle.
            </p>
          </Section>

          <Section title="🎓 Le conseil du coach">
            <p>
              Un CV n&apos;a pas vocation à être figé. Adaptez-le légèrement selon chaque offre : reprenez certains mots
              clés de l&apos;annonce, réordonnez vos expériences pour mettre en avant celle la plus proche du poste visé.
            </p>
            <p>
              Un CV « générique » envoyé à toutes les entreprises fonctionne toujours moins bien qu&apos;un CV
              légèrement ajusté à chaque candidature — même quelques minutes d&apos;ajustement font la différence.
            </p>
          </Section>
        </div>

        <div className="mt-10 rounded-2xl bg-primary px-6 py-10 text-center shadow-pop sm:px-10">
          <h2 className="font-display text-xl font-bold text-white">
            Envie d&apos;un accompagnement complet, pas juste des conseils ?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-primary-100/90">
            Déposez votre CV, obtenez un score de correspondance avec chaque offre, et générez vos messages avec
            l&apos;IA — gratuitement.
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
