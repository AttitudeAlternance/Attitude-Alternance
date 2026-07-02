"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, Select } from "@/components/ui/Form";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import {
  MESSAGE_TYPE_LABELS,
  type Application,
  type GeneratedMessage,
  type MessageTone,
  type MessageType,
  type Profile,
} from "@/lib/types";

interface MessageGeneratorProps {
  profile: Profile | null;
  userId: string;
  history: GeneratedMessage[];
  applications: Application[];
  initialApplicationId?: string;
}

const messageTypes: MessageType[] = ["candidature", "relance", "linkedin", "remerciement"];
const tones: { value: MessageTone; label: string }[] = [
  { value: "professionnel", label: "Professionnel" },
  { value: "direct", label: "Direct" },
  { value: "chaleureux", label: "Chaleureux" },
];

export function MessageGenerator({
  profile,
  userId,
  history: initialHistory,
  applications,
  initialApplicationId,
}: MessageGeneratorProps) {
  const [type, setType] = useState<MessageType>("candidature");
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [tone, setTone] = useState<MessageTone>("professionnel");
  const [personalInfo, setPersonalInfo] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedRealAi, setUsedRealAi] = useState(true);
  const [variantCount, setVariantCount] = useState(0);
  const [history, setHistory] = useState<GeneratedMessage[]>(initialHistory);

  const supabase = createClient();

  function handleSelectApplication(applicationId: string) {
    setSelectedApplicationId(applicationId);
    if (!applicationId) return;

    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;

    setCompany(app.company);
    setRole(app.role);
    if (app.linkedin_contact) setRecruiterName(app.linkedin_contact);
    if (app.comment) setPersonalInfo(app.comment);
    if (app.job_description) setJobDescription(app.job_description);
  }

  // Si l'étudiant arrive depuis "Mes candidatures" en cliquant sur "Générer un message",
  // la candidature correspondante est automatiquement sélectionnée et les champs pré-remplis.
  useEffect(() => {
    if (initialApplicationId) {
      handleSelectApplication(initialApplicationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialApplicationId]);

  async function callGenerateApi(previousMessage?: string, seed?: number) {
    const res = await fetch("/api/generate-message", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type,
        company,
        role,
        recruiterName,
        tone,
        personalInfo,
        jobDescription,
        cvSummary: profile?.cv_summary,
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        formation: profile?.formation,
        previousMessage,
        variantSeed: seed,
      }),
    });

    if (!res.ok) throw new Error("generation_failed");
    return res.json();
  }

  async function saveToHistory(content: string) {
    const { data: saved } = await supabase
      .from("generated_messages")
      .insert({
        user_id: userId,
        application_id: selectedApplicationId || null,
        type,
        company,
        role,
        recruiter_name: recruiterName || null,
        tone,
        content,
      })
      .select()
      .single();

    if (saved) setHistory((prev) => [saved as GeneratedMessage, ...prev]);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCopied(false);
    setVariantCount(0);

    try {
      const data = await callGenerateApi();
      setResult(data.content);
      setUsedRealAi(data.usedRealAi);
      await saveToHistory(data.content);
    } catch {
      setError("La génération a échoué. Réessayez dans quelques instants.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate() {
    if (!result) return;
    setRegenerating(true);
    setError(null);
    setCopied(false);

    try {
      const nextSeed = variantCount + 1;
      const data = await callGenerateApi(result, nextSeed);
      setResult(data.content);
      setUsedRealAi(data.usedRealAi);
      setVariantCount(nextSeed);
      await saveToHistory(data.content);
    } catch {
      setError("La génération d'une nouvelle proposition a échoué. Réessayez.");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <div className="mb-5 flex flex-wrap gap-2">
          {messageTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                type === t
                  ? "border-primary bg-primary text-white"
                  : "border-line text-ink/70 hover:border-primary-200 hover:bg-primary-50"
              )}
            >
              {MESSAGE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          {profile?.cv_summary && (
            <p className="rounded-lg bg-success-50 px-3 py-2 text-xs font-medium text-success">
              ✓ Votre CV est pris en compte automatiquement pour personnaliser ce message.
            </p>
          )}

          {applications.length > 0 && (
            <div>
              <Label htmlFor="application">Lier à une candidature existante (optionnel)</Label>
              <Select
                id="application"
                value={selectedApplicationId}
                onChange={(e) => handleSelectApplication(e.target.value)}
              >
                <option value="">— Remplir manuellement —</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.company} — {app.role}
                  </option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-muted">
                Sélectionner une candidature remplit automatiquement l&apos;entreprise, le poste, le contact et la description de l&apos;offre ci-dessous.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="company">Entreprise *</Label>
              <Input id="company" required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Ex : Lumeo Digital" />
            </div>
            <div>
              <Label htmlFor="role">Poste visé *</Label>
              <Input id="role" required value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex : Alternant marketing digital" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="recruiterName">Nom du recruteur (si connu)</Label>
              <Input id="recruiterName" value={recruiterName} onChange={(e) => setRecruiterName(e.target.value)} placeholder="Ex : Sophie Martin" />
            </div>
            <div>
              <Label htmlFor="tone">Ton souhaité</Label>
              <Select id="tone" value={tone} onChange={(e) => setTone(e.target.value as MessageTone)}>
                {tones.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="jobDescription">Description du poste (optionnel)</Label>
            <Textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Collez ici le texte de l'annonce trouvée sur le site d'emploi, pour un message plus personnalisé."
            />
          </div>

          <div>
            <Label htmlFor="personalInfo">Informations personnelles à intégrer</Label>
            <Textarea
              id="personalInfo"
              value={personalInfo}
              onChange={(e) => setPersonalInfo(e.target.value)}
              placeholder="Ex : 2 ans d'expérience en stage marketing, maîtrise de Canva et Meta Ads..."
            />
          </div>

          {error && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Génération..." : "✦ Générer le message"}
          </Button>
        </form>

        {result && (
          <div className="mt-6 rounded-2xl border border-line bg-paper/60 p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink">Message généré</span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={handleRegenerate} disabled={regenerating}>
                  {regenerating ? "Nouvelle proposition..." : "↻ Autre proposition"}
                </Button>
                <Button size="sm" variant="secondary" onClick={handleCopy}>
                  {copied ? "Copié ✓" : "Copier le texte"}
                </Button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap font-body text-sm text-ink/90">{result}</pre>
            {!usedRealAi && (
              <p className="mt-3 text-xs text-warn">
                Message généré en mode simplifié (aucune clé IA configurée) — connectez ANTHROPIC_API_KEY pour une rédaction plus naturelle.
              </p>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-base font-semibold text-ink">Derniers messages générés</h2>
        {history.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Aucun message généré"
              description="Vos messages générés apparaîtront ici pour être retrouvés facilement."
            />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {history.slice(0, 8).map((msg) => (
              <li key={msg.id} className="rounded-xl border border-line px-3.5 py-3">
                <p className="text-xs font-semibold text-primary">{MESSAGE_TYPE_LABELS[msg.type]}</p>
                <p className="mt-0.5 text-sm font-medium text-ink">{msg.company}</p>
                <p className="text-xs text-muted">{msg.role}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
