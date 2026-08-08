import type { Metadata } from "next";
import { FasupSchoolDemo } from "@/components/apercu/FasupSchoolDemo";

// Page de démo interactive pour FASUP' Bordeaux — volontairement NON listée :
// pas de lien depuis le site public, pas dans sitemap.ts, et indexation désactivée
// ci-dessous. Seule une personne ayant reçu ce lien directement peut y accéder.
// Données 100% fictives (voir FasupSchoolDemo.tsx) — rien de connecté à Supabase.
// Si le partenariat se concrétise, cette page sera remplacée par le vrai tableau de
// bord école (voir supabase/migration_schools.sql pour les fondations déjà posées).
export const metadata: Metadata = {
  title: "Attitude Alternance × FASUP' Bordeaux",
  description: "Démo personnalisée pour FASUP' Bordeaux.",
  robots: { index: false, follow: false },
};

export default function FasupBordeauxApercuPage() {
  return <FasupSchoolDemo />;
}
