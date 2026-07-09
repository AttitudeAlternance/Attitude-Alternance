"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AGE_RANGES } from "@/lib/types";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Form";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ageRange, setAgeRange] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Lit le code de parrainage depuis l'URL (?ref=CODE), sans avoir besoin de useSearchParams
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferralCode(ref);
  }, []);

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

    // Enregistre la date d'acceptation des CGU et la tranche d'âge (facultative) sur le profil
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        terms_accepted_at: new Date().toISOString(),
        age_range: ageRange || null,
      });
    }

    // Si un code de parrainage était présent dans le lien, on l'enregistre (bonus des deux côtés)
    if (data.session && referralCode) {
      try {
        await fetch("/api/register-referral", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code: referralCode }),
        });
      } catch {
        // Un parrainage raté ne doit jamais bloquer la création de compte
      }
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
        {referralCode && (
          <p className="rounded-lg bg-success-50 px-3 py-2 text-xs font-medium text-success">
            ✓ Parrainage détecté — vous et votre parrain recevrez chacun 5 candidatures bonus.
          </p>
        )}

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
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="6 caractères minimum"
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

        <div>
          <Label htmlFor="ageRange">Tranche d&apos;âge (optionnel)</Label>
          <Select id="ageRange" value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
            <option value="">Je préfère ne pas répondre</option>
            {AGE_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-muted">
            Utilisée uniquement pour des statistiques anonymisées et agrégées, jamais partagée individuellement.
          </p>
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
