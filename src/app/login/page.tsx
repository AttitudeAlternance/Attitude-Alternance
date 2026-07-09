"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Form";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthLayout
      title="Content de vous revoir"
      description="Connectez-vous pour retrouver votre espace de recherche d'alternance."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Créer un compte
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="prenom.nom@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 3l18 18" strokeLinecap="round" />
                  <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                  <path d="M9.5 5.2A9.8 9.8 0 0 1 12 5c5 0 9 4 10 7-.4 1.1-1.1 2.3-2.1 3.4M6.5 6.6C4.6 7.9 3.1 9.8 2 12c1 3 5 7 10 7 1.3 0 2.5-.3 3.6-.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </AuthLayout>
  );
}
