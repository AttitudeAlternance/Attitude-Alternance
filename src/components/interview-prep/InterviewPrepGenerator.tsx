"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Form";
import { EmptyState } from "@/components/ui/EmptyState";
import { AiLoadingState } from "@/components/ui/AiLoadingState";
import type { Application, Profile } from "@/lib/types";
import type { InterviewPrep } from "@/lib/ai/generateInterviewPrep";

interface InterviewPrepGeneratorProps {
  profile: Profile | null;
  applications: Application[];
}

export function InterviewPrepGenerator({ profile, applications }: InterviewPrepGeneratorProps) {
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [prep, setPrep] = useState<InterviewPrep | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedRealAi, setUsedRealAi] = useState(true);
  const [copied, setCopied] = useState(false);

  const selectedApp = applications.find((a) => a.id === selectedApplicationId) ?? null;

  async function handleGenerate() {
    if (!selectedApp) return;

    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch("/api/generate-interview-prep", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          company: selectedApp.company,
          role: selectedApp.role,
          jobDescription: selectedApp.job_description ?? undefined,
          cvSummary: profile?.cv_summary ?? undefined,
          firstName: profile?.first_name ?? undefined,
          formation: profile?.formation ?? undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Impossible de générer la préparation pour le moment.");
        return;
      }

      setPrep(data.prep);
      setUsedRealAi(data.usedRealAi);
    } catch {
      setError("Une erreur est survenue pendant la génération.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!prep || !selectedApp) return;

    const text = [
      `PRÉPARATION D'ENTRETIEN — ${selectedApp.role} chez ${selectedApp.company}`,
      "",
      "CE QUE L'ANNONCE RÉVÈLE VRAIMENT",
      ...prep.besoinsImplicites.map((item) => `- ${item}`),
      "",
      "VOTRE AXE DIFFÉRENCIANT",
      prep.axeDifferenciant,
      "",
      "LE POSTE EN BREF",
      prep.syntheseAnnonce,
      "",
      "VOTRE PITCH",
      prep.pitch,
      "",
      "VOS AUTRES POINTS FORTS",
      ...prep.pointsForts.map((item) => `- ${item}`),
      "",
      "ASTUCES QUI PEUVENT FAIRE LA DIFFÉRENCE",
      ...prep.astuces.map((item) => `- ${item}`),
      "",
      "QUESTIONS PROBABLES",
      ...prep.questionsProbables.map((item) => `- ${item}`),
      "",
      "QUESTIONS À POSER AU RECRUTEUR",
      ...prep.questionsARecruteur.map((item) => `- ${item}`),
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (applications.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Aucune candidature pour l'instant"
          description="Ajoutez d'abord une candidature depuis « Mes candidatures » pour préparer un entretien."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <Label htmlFor="application">Pour quelle candidature ?</Label>
        <Select
          id="application"
          value={selectedApplicationId}
          onChange={(e) => {
            setSelectedApplicationId(e.target.value);
            setPrep(null);
            setError(null);
          }}
        >
          <option value="">Choisissez une candidature</option>
          {applications.map((app) => (
            <option key={app.id} value={app.id}>
              {app.company} — {app.role}
            </option>
          ))}
        </Select>

        {selectedApp && !selectedApp.job_description && (
          <p className="mt-2 text-xs text-warn">
            Cette candidature n&apos;a pas de description d&apos;offre enregistrée — la préparation sera plus
            générique. Vous pouvez l&apos;ajouter depuis « Mes candidatures » pour un résultat plus précis.
          </p>
        )}

        {error && <p className="mt-3 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger">{error}</p>}

        <Button className="mt-4" onClick={handleGenerate} disabled={!selectedApplicationId || loading}>
          {loading ? "Génération en cours..." : "Générer ma préparation"}
        </Button>
      </Card>

      {loading && selectedApp && (
        <AiLoadingState
          message={`Patientez quelques secondes, on prépare votre entretien chez ${selectedApp.company}...`}
          steps={[
            "Lecture de l'annonce...",
            "Analyse de votre profil...",
            "Préparation des questions probables...",
            "Finalisation du dossier...",
          ]}
        />
      )}

      {prep && selectedApp && !loading && (
        <div className="space-y-4">
          {!usedRealAi && (
            <p className="rounded-lg bg-warn-50 px-3 py-2 text-xs text-warn">
              Généré avec le mode de secours (IA non configurée) — le contenu est plus générique qu&apos;à
              l&apos;habitude.
            </p>
          )}

          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">
              {selectedApp.role} chez {selectedApp.company}
            </h2>
            <Button size="sm" variant="secondary" onClick={handleCopy}>
              {copied ? "Copié ✓" : "Copier tout"}
            </Button>
          </div>

          <Card>
            <h3 className="font-display text-sm font-semibold text-ink">🔎 Ce que l&apos;annonce révèle vraiment</h3>
            <ul className="mt-2 space-y-2 text-sm text-ink/85">
              {prep.besoinsImplicites.map((item, i) => (
                <li key={i} className="border-l-2 border-primary-200 pl-3">
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <div className="rounded-2xl border-2 border-primary bg-primary-50 p-6 shadow-card">
            <h3 className="font-display text-sm font-semibold text-primary-600">⭐ Votre axe différenciant</h3>
            <p className="mt-2 text-sm font-medium text-ink">{prep.axeDifferenciant}</p>
          </div>

          <Card>
            <h3 className="font-display text-sm font-semibold text-ink">🏢 Le poste en bref</h3>
            <p className="mt-2 text-sm text-ink/85">{prep.syntheseAnnonce}</p>
          </Card>

          <Card>
            <h3 className="font-display text-sm font-semibold text-ink">🎤 Votre pitch</h3>
            <p className="mt-2 text-sm italic text-ink/85">{prep.pitch}</p>
          </Card>

          <Card>
            <h3 className="font-display text-sm font-semibold text-ink">💪 Vos autres points forts</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/85">
              {prep.pointsForts.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Card>

          <div className="rounded-2xl border border-accent-100 bg-accent-50 p-6 shadow-card">
            <h3 className="font-display text-sm font-semibold text-ink">💡 Astuces qui peuvent faire la différence</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/85">
              {prep.astuces.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <Card>
            <h3 className="font-display text-sm font-semibold text-ink">❓ Questions probables</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/85">
              {prep.questionsProbables.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="font-display text-sm font-semibold text-ink">🎯 Questions à poser au recruteur</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/85">
              {prep.questionsARecruteur.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
