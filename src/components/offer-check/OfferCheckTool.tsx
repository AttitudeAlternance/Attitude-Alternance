"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, Select } from "@/components/ui/Form";
import { cn } from "@/lib/utils";
import { detectSchoolOffer, type SchoolOfferDetectionResult } from "@/lib/detectSchoolOffer";
import type { Application } from "@/lib/types";

interface OfferCheckToolProps {
  applications: Application[];
  initialApplicationId?: string;
}

export function OfferCheckTool({ applications, initialApplicationId }: OfferCheckToolProps) {
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [offerUrl, setOfferUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [fetchingOffer, setFetchingOffer] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [result, setResult] = useState<SchoolOfferDetectionResult | null>(null);

  function handleSelectApplication(id: string) {
    setSelectedApplicationId(id);
    setResult(null);
    const app = applications.find((a) => a.id === id);
    if (app) {
      setJobDescription(app.job_description ?? "");
      setOfferUrl(app.offer_url ?? "");
    }
  }

  useEffect(() => {
    if (initialApplicationId) {
      handleSelectApplication(initialApplicationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialApplicationId]);

  async function handleFetchOffer() {
    setFetchError(null);
    if (!offerUrl.trim()) {
      setFetchError("Collez d'abord le lien de l'offre ci-dessus.");
      return;
    }
    setFetchingOffer(true);
    try {
      const res = await fetch("/api/fetch-offer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: offerUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFetchError(data.error || "Récupération impossible.");
        return;
      }
      setJobDescription(data.text);
    } catch {
      setFetchError("Une erreur est survenue. Copiez-collez le texte manuellement.");
    } finally {
      setFetchingOffer(false);
    }
  }

  function handleAnalyze() {
    setResult(detectSchoolOffer(jobDescription, offerUrl));
  }

  const barColor = !result
    ? "bg-line"
    : result.percentage >= 60
      ? "bg-danger"
      : result.percentage >= 40
        ? "bg-warn"
        : "bg-success";

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        {applications.length > 0 && (
          <div className="mb-4">
            <Label htmlFor="application">Choisir une candidature existante (optionnel)</Label>
            <Select id="application" value={selectedApplicationId} onChange={(e) => handleSelectApplication(e.target.value)}>
              <option value="">— Coller un lien ou un texte manuellement —</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company} — {app.role}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="offerUrl">Lien de l&apos;offre (optionnel)</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id="offerUrl"
              type="url"
              value={offerUrl}
              onChange={(e) => setOfferUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 min-w-[200px]"
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleFetchOffer} disabled={fetchingOffer}>
              {fetchingOffer ? "Lecture..." : "↓ Récupérer le texte"}
            </Button>
          </div>
          {fetchError && <p className="mt-1.5 text-xs text-warn">{fetchError}</p>}
        </div>

        <div className="mt-4">
          <Label htmlFor="jobDescription">Texte de l&apos;offre</Label>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Collez ici le texte de l'annonce à vérifier."
            className="min-h-[180px]"
          />
        </div>

        <Button className="mt-4" onClick={handleAnalyze} disabled={!jobDescription.trim() && !offerUrl.trim()}>
          🔍 Analyser cette offre
        </Button>

        {result && (
          <div className="mt-6 rounded-2xl border border-line bg-paper/60 p-5">
            <div className="flex items-center gap-3">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-line">
                <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${result.percentage}%` }} />
              </div>
              <span className="font-display text-xl font-bold text-ink">{result.percentage}%</span>
            </div>
            <p className="mt-2 text-sm font-medium text-ink">
              {result.percentage >= 60
                ? "Risque élevé : cette annonce ressemble beaucoup à une offre-leurre d'école."
                : result.percentage >= 40
                  ? "Risque modéré : plusieurs signaux d'offre-leurre d'école sont présents."
                  : result.percentage > 0
                    ? "Risque faible : peu de signaux détectés."
                    : "Aucun signal caractéristique détecté."}
            </p>

            {result.matchedSignals.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-warn">Signaux repérés</p>
                <ul className="mt-1.5 space-y-1">
                  {result.matchedSignals.map((s, i) => (
                    <li key={i} className="text-sm text-ink/80">• {s}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-4 text-xs text-muted">
              Cette estimation est basée sur des tournures et un vocabulaire courants dans ce type d&apos;annonces,
              pas une certitude absolue. Vérifiez toujours par vous-même (nom réel de l&apos;entreprise, description
              concrète des missions) avant de vous engager.
            </p>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-base font-semibold text-ink">Pourquoi ça compte</h2>
        <p className="mt-3 text-sm text-ink/80">
          Certaines écoles publient de fausses offres d&apos;alternance sur les sites d&apos;emploi pour capter des
          candidats, qui se retrouvent en réalité redirigés vers un formulaire d&apos;admission à une formation, sans
          rapport avec une vraie entreprise recruteuse.
        </p>
        <p className="mt-3 text-sm text-ink/80">
          Ce détecteur repère les tournures typiques de ce genre d&apos;annonces (journées portes ouvertes, admissions,
          frais de scolarité, ciblage des lycéens...) pour vous éviter de perdre du temps.
        </p>
      </Card>
    </div>
  );
}
