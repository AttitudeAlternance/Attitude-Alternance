"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Textarea, Select } from "@/components/ui/Form";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import type { Application } from "@/lib/types";

interface MatchScoreToolProps {
  cvSummary: string | null;
  applications: Application[];
  initialApplicationId?: string;
}

interface MatchResult {
  score: number;
  strengths: string[];
  gaps: string[];
  usedRealAi: boolean;
}

export function MatchScoreTool({ cvSummary, applications, initialApplicationId }: MatchScoreToolProps) {
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  function handleSelectApplication(id: string) {
    setSelectedApplicationId(id);
    setMatchResult(null);
    setMatchError(null);
    const app = applications.find((a) => a.id === id);
    if (app?.job_description) setJobDescription(app.job_description);
  }

  // Arrivée depuis "Mes candidatures" via le bouton "Score de correspondance" : pré-sélection automatique
  useEffect(() => {
    if (initialApplicationId) {
      handleSelectApplication(initialApplicationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialApplicationId]);

  async function handleAnalyze() {
    setMatchError(null);
    setMatchResult(null);

    if (!cvSummary) {
      setMatchError("Déposez d'abord votre CV dans votre profil pour utiliser cette analyse.");
      return;
    }
    if (!jobDescription.trim()) {
      setMatchError("Collez ou sélectionnez d'abord une description d'offre.");
      return;
    }

    setMatching(true);
    try {
      const res = await fetch("/api/match-score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cvSummary, jobDescription }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMatchError(data.error || "Analyse impossible.");
        return;
      }
      setMatchResult(data);
    } catch {
      setMatchError("Une erreur est survenue lors de l'analyse.");
    } finally {
      setMatching(false);
    }
  }

  if (!cvSummary) {
    return (
      <EmptyState
        title="Déposez d'abord votre CV"
        description="Le score de correspondance a besoin d'un CV analysé pour comparer votre profil à une offre. Rendez-vous dans « Mon profil » pour le déposer."
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        {applications.length > 0 && (
          <div className="mb-4">
            <Label htmlFor="application">Choisir une candidature existante (optionnel)</Label>
            <Select id="application" value={selectedApplicationId} onChange={(e) => handleSelectApplication(e.target.value)}>
              <option value="">— Coller une description manuellement —</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company} — {app.role}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="jobDescription">Description de l&apos;offre</Label>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Collez ici le texte de l'offre (missions, profil recherché...)."
            className="min-h-[180px]"
          />
        </div>

        <Button className="mt-4" onClick={handleAnalyze} disabled={matching}>
          {matching ? "Analyse..." : "🎯 Analyser la correspondance"}
        </Button>

        {matchError && <p className="mt-3 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger">{matchError}</p>}

        {matchResult && (
          <div className="mt-6 rounded-2xl border border-line bg-paper/60 p-5">
            <div className="flex items-center gap-3">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-line">
                <div
                  className={cn(
                    "h-full rounded-full",
                    matchResult.score >= 70 ? "bg-success" : matchResult.score >= 40 ? "bg-warn" : "bg-danger"
                  )}
                  style={{ width: `${matchResult.score}%` }}
                />
              </div>
              <span className="font-display text-xl font-bold text-ink">{matchResult.score}%</span>
            </div>

            {matchResult.strengths.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-success">Points forts</p>
                <ul className="mt-1.5 space-y-1">
                  {matchResult.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-ink/80">• {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {matchResult.gaps.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-warn">À renforcer ou mentionner</p>
                <ul className="mt-1.5 space-y-1">
                  {matchResult.gaps.map((g, i) => (
                    <li key={i} className="text-sm text-ink/80">• {g}</li>
                  ))}
                </ul>
              </div>
            )}

            {!matchResult.usedRealAi && (
              <p className="mt-4 text-xs text-muted">
                Estimation simplifiée basée sur des mots-clés (aucune clé IA configurée) — le résultat avec Claude actif est plus fiable.
              </p>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-base font-semibold text-ink">Comment ça marche</h2>
        <ol className="mt-3 space-y-2.5 text-sm text-ink/80">
          <li>1. Choisissez une candidature déjà enregistrée, ou collez une description d&apos;offre.</li>
          <li>2. Cliquez sur « Analyser la correspondance ».</li>
          <li>3. Consultez votre score, vos points forts, et ce qu&apos;il faudrait renforcer ou mentionner.</li>
        </ol>
      </Card>
    </div>
  );
}
