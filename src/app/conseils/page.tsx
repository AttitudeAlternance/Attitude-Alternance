import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/landing/CTAFooter";

export const metadata = {
  title: "Conseils alternance — Attitude Alternance",
  description: "Guides gratuits pour réussir sa recherche d'alternance : entretien, CV, LinkedIn, relance.",
};

const guides = [
  {
    slug: "preparer-entretien-alternance",
    title: "Préparer son entretien d'alternance",
    description: "La méthode complète pour arriver confiant : fiche de poste, présentation, questions fréquentes, et le conseil du coach.",
    icon: "🎤",
  },
];

export default function ConseilsIndexPage() {
  return (
    <main className="min-h-screen bg-paper">
      <PublicNavbar />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-ink">Conseils pour votre recherche d&apos;alternance</h1>
        <p className="mt-3 max-w-xl text-muted">
          Des guides gratuits, écrits pour de vrais étudiants en recherche d&apos;alternance — pas de blabla générique.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/conseils/${guide.slug}`}
              className="rounded-2xl border border-line bg-white p-6 shadow-card transition-shadow hover:shadow-pop"
            >
              <span className="text-2xl" aria-hidden="true">{guide.icon}</span>
              <h2 className="mt-3 font-display text-lg font-semibold text-ink">{guide.title}</h2>
              <p className="mt-2 text-sm text-muted">{guide.description}</p>
              <span className="mt-4 inline-block text-sm font-medium text-primary">Lire le guide →</span>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
