import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/landing/CTAFooter";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Guide de démarrage — Attitude Alternance",
  description: "Prenez en main Attitude Alternance en 6 étapes simples : compte, CV, candidatures, messages IA, score de correspondance.",
};

const steps = [
  {
    number: 1,
    title: "Créez votre compte",
    text: "Rendez-vous sur le site et cliquez sur « Créer mon compte ». Renseignez votre prénom, votre email et un mot de passe — ça prend trente secondes.",
    image: "/guide/01-inscription.jpg",
    alt: "Page d'inscription Attitude Alternance",
  },
  {
    number: 2,
    title: "Déposez votre CV dans « Mon profil »",
    text: "Une fois connecté, allez dans « Mon profil » et déposez votre CV au format PDF. C'est une étape essentielle : le site va le lire pour comprendre votre parcours, et s'en servira ensuite automatiquement pour personnaliser vos messages et calculer votre score de correspondance.",
    image: "/guide/02-cv.jpg",
    alt: "Zone de dépôt du CV",
  },
  {
    number: 3,
    title: "Ajoutez votre première candidature",
    text: "Allez dans « Mes candidatures » puis cliquez sur « + Ajouter une candidature ». Renseignez l'entreprise, le poste, et si possible le lien ou la description complète de l'offre : elle sera réutilisée automatiquement pour générer vos messages.",
    image: "/guide/03-candidature.jpg",
    alt: "Formulaire d'ajout d'une candidature",
  },
  {
    number: 4,
    title: "Générez un message personnalisé",
    text: "Depuis votre candidature, cliquez sur « Générer un message ». Le site rédige un mail de candidature (ou un message LinkedIn, une relance, un remerciement) en croisant votre CV et l'offre. Vous pouvez l'ajuster librement, ou demander une autre version en un clic.",
    image: "/guide/04-message.jpg",
    alt: "Formulaire de génération de message",
  },
  {
    number: 5,
    title: "Vérifiez votre score de correspondance",
    text: "Avant même de candidater, comparez votre CV à une offre pour évaluer vos chances : un pourcentage, vos points forts, et ce qu'il faudrait renforcer ou mentionner.",
    image: "/guide/05-score.jpg",
    alt: "Outil de score de correspondance",
  },
  {
    number: 6,
    title: "Suivez vos candidatures et vos relances",
    text: "La « Vue d'ensemble » centralise vos statistiques et vous rappelle les relances à faire, sans que vous ayez besoin d'y penser.",
    image: "/guide/06-dashboard.jpg",
    alt: "Tableau de bord avec statistiques et relances",
  },
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-paper">
      <PublicNavbar />

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary-500">Guide de démarrage</span>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
            Prenez en main le site en 6 étapes
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted sm:text-base">
            Un espace pour centraliser vos candidatures, générer des messages personnalisés avec l&apos;IA, et ne
            plus jamais oublier une relance. Suivez les étapes ci-dessous, dans l&apos;ordre.
          </p>
        </div>

        <div className="mt-14 space-y-14">
          {steps.map((step) => (
            <div key={step.number} className="grid items-center gap-6 sm:grid-cols-2">
              <div className={step.number % 2 === 0 ? "sm:order-2" : ""}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-white">
                  {step.number}
                </span>
                <h2 className="mt-3 font-display text-xl font-bold text-ink">{step.title}</h2>
                <p className="mt-2 text-sm text-muted">{step.text}</p>
              </div>
              <div className={step.number % 2 === 0 ? "sm:order-1" : ""}>
                <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                  <Image
                    src={step.image}
                    alt={step.alt}
                    width={640}
                    height={320}
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-primary px-6 py-10 text-center shadow-pop sm:px-10">
          <h2 className="font-display text-xl font-bold text-white">C&apos;est tout ce qu&apos;il faut savoir pour démarrer</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-primary-100/90">
            Explorez aussi la rubrique « Ressources » une fois connecté : conseils CV, LinkedIn, entretien, méthode
            de relance. C&apos;est gratuit pour commencer.
          </p>
          <Link href="/signup" className="mt-6 inline-block">
            <Button size="lg" variant="secondary" className="border-transparent">
              Créer mon compte
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
