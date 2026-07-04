"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Form";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!acceptedTerms) {
      setError("Vous devez accepter les CGU et la politique de confidentialité pour créer un compte.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName },
      },
    });

    if (error) {
      setLoading(false);
      setError(error.message === "User already registered" ? "Un compte existe déjà avec cet email." : "Une erreur est survenue. Réessayez.");
      return;
    }

    // Enregistre la date d'acceptation des CGU sur le profil (preuve de consentement)
    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, terms_accepted_at: new Date().toISOString() });
    }

    setLoading(false);

    // Si la confirmation par email est désactivée dans Supabase, une session existe déjà
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <AuthLayout
        title="Vérifiez votre boîte mail"
        description="Un email de confirmation vient de vous être envoyé."
        footer={
          <Link href="/login" className="font-medium text-primary hover:underline">
            Retour à la connexion
          </Link>
        }
      >
        <p className="text-sm text-muted">
          Cliquez sur le lien reçu par email pour activer votre compte, puis connectez-vous.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Créer votre compte"
      description="Rejoignez Attitude Alternance et structurez votre recherche dès aujourd'hui."
      footer={
        <>
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            required
            placeholder="Camille"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
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
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="6 caractères minimum"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <label className="flex items-start gap-2.5 text-xs text-muted">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-line text-primary focus:ring-primary-200"
          />
          <span>
            J&apos;accepte les{" "}
            <Link href="/cgu" target="_blank" className="font-medium text-primary hover:underline">
              Conditions Générales d&apos;Utilisation
            </Link>{" "}
            et la{" "}
            <Link href="/confidentialite" target="_blank" className="font-medium text-primary hover:underline">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>

        {error && (
          <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading || !acceptedTerms}>
          {loading ? "Création..." : "Créer mon compte"}
        </Button>
      </form>
    </AuthLayout>
  );
}
