import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/landing/CTAFooter";

export function LegalLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-paper">
      <PublicNavbar />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm text-muted">Dernière mise à jour : {updatedAt}</p>
        <div className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-ink/90">{children}</div>
      </div>
      <Footer />
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
