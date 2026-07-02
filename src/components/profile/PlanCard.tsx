"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface PlanCardProps {
  plan: "free" | "premium";
  justUpgraded: boolean;
}

export function PlanCard({ plan, justUpgraded }: PlanCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      {plan === "free" ? (
        <>
          <Button onClick={handleUpgrade} disabled={loading}>
            {loading ? "Redirection..." : "Passer à Étudiant+"}
          </Button>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </>
      ) : (
        <p className="text-sm text-muted">
          Pour gérer ou annuler votre abonnement, contactez le support ou utilisez le lien reçu par email lors de votre paiement.
        </p>
      )}
    </Card>
  );
}
