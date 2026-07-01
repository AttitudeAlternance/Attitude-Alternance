import Link from "next/link";
import { Logo } from "@/components/layout/PublicNavbar";

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <Logo />
          <span className="font-display text-base font-semibold text-ink">AlternanceBoost</span>
        </Link>

        <div className="rounded-2xl border border-line bg-white p-7 shadow-card">
          <h1 className="font-display text-xl font-bold text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{description}</p>
          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-5 text-center text-sm text-muted">{footer}</p>
      </div>
    </main>
  );
}
