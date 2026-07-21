"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface PlanCardProps {
  plan: "free" | "premium";
  justUpgraded: boolean;
  stripeConfigured: boolean;
  initialWaitlistJoined: boolean;
}

export function PlanCard({ plan, justUpgraded, stripeConfigured, initialWaitlistJoined }: PlanCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitlistJoined, setWaitlistJoined] = useState(initialWaitlistJoined);

  // Quand on clique sur "Passer à Étudiant+", la page redirige vers Stripe puis le
  // navigateur peut restaurer cette page depuis son cache (bouton "précédent" après
  // annulation du paiement) sans la recharger. Le state "loading" restait alors bloqué
  // à true pour toujours, gardant le bouton coincé sur "Redirection...". On le
  // réinitialise explicitement dès que la page redevient visible dans ce cas.
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        setLoading(false);
      }
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/create-checkout-session", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Impossible de démarrer le paiement pour le moment.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Une erreur est survenue.");
      setLoading(false);
    }
  }

  async function handleJoinWaitlist() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/join-waitlist", { method: "POST" });
      if (!res.ok) {
        setError("Impossible de vous inscrire pour le moment. Réessayez.");
        return;
      }
      setWaitlistJoined(true);
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mon abonnement</CardTitle>
        <CardDescription>
          {plan === "premium"
            ? "Vous êtes sur l'offre Étudiant+ : candidatures illimitées et quota IA étendu."
            : "Vous êtes sur l'offre gratuite : suivi limité et quota IA de base."}
        </CardDescription>
      </CardHeader>

      {justUpgraded && plan === "premium" && (
        <p className="mb-3 rounded-lg bg-success-50 px-3 py-2 text-sm font-medium text-success">
          Paiement confirmé, bienvenue dans Étudiant+ 🎉
        </p>
      )}

      {plan === "free" && stripeConfigured && (
        <>
          <Button onClick={handleUpgrade} disabled={loading}>
            {loading ? "Redirection..." : "Passer à Étudiant+"}
          </Button>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </>
      )}

      {plan === "free" && !stripeConfigured && (
        <>
          {waitlistJoined ? (
            <p className="rounded-lg bg-success-50 px-3 py-2 text-sm font-medium text-success">
              ✓ Vous êtes sur la liste d&apos;attente — vous serez prévenu(e) dès que Étudiant+ sera disponible au paiement.
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm text-muted">
                Le paiement Étudiant+ n&apos;est pas encore activé. Inscrivez-vous sur la liste d&apos;attente pour être
                prévenu(e) dès son ouverture.
              </p>
              <Button onClick={handleJoinWaitlist} disabled={loading} variant="secondary">
                {loading ? "Inscription..." : "Rejoindre la liste d'attente"}
              </Button>
              {error && <p className="mt-2 text-sm text-danger">{error}</p>}
            </>
          )}
        </>
      )}

      {plan === "premium" && (
        <p className="text-sm text-muted">
          Pour gérer ou annuler votre abonnement, contactez le support ou utilisez le lien reçu par email lors de votre paiement.
        </p>
      )}
    </Card>
  );
}
