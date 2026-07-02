"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, Select } from "@/components/ui/Form";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import {
  MESSAGE_TYPE_LABELS,
  type GeneratedMessage,
  type MessageTone,
  type MessageType,
  type Profile,
} from "@/lib/types";

interface MessageGeneratorProps {
  profile: Profile | null;
  userId: string;
  history: GeneratedMessage[];
}

const messageTypes: MessageType[] = ["candidature", "relance", "linkedin", "remerciement"];
const tones: { value: MessageTone; label: string }[] = [
  { value: "professionnel", label: "Professionnel" },
  { value: "direct", label: "Direct" },
  { value: "chaleureux", label: "Chaleureux" },
];

export function MessageGenerator({ profile, userId, history: initialHistory }: MessageGeneratorProps) {
  const [type, setType] = useState<MessageType>("candidature");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [tone, setTone] = useState<MessageTone>("professionnel");
  const [personalInfo, setPersonalInfo] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedRealAi, setUsedRealAi] = useState(true);
  const [history, setHistory] = useState<GeneratedMessage[]>(initialHistory);

  const supabase = createClient();

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
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
        }),
      });

      if (!res.ok) throw new Error("generation_failed");
      const data = await res.json();
      setResult(data.content);
      setUsedRealAi(data.usedRealAi);

      const { data: saved } = await supabase
        .from("generated_messages")
        .insert({
          user_id: userId,
          type,
          company,
          role,
          recruiter_name: recruiterName || null,
          tone,
          content: data.content,
        })
        .select()
        .single();

      if (saved) setHistory((prev) => [saved as GeneratedMessage, ...prev]);
    } catch {
      setError("La génération a échoué. Réessayez dans quelques instants.");
    } finally {
      setLoading(false);
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
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">Message généré</span>
              <Button size="sm" variant="secondary" onClick={handleCopy}>
                {copied ? "Copié ✓" : "Copier le texte"}
              </Button>
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
