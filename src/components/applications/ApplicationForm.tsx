"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, Select, FieldHint } from "@/components/ui/Form";
import { cn, addBusinessDays } from "@/lib/utils";
import { APPLICATION_STATUSES, STATUS_LABELS, type Application, type ApplicationInput } from "@/lib/types";

// Nombre de jours ouvrés recommandé avant une première relance après candidature
const RECOMMENDED_FOLLOWUP_DAYS = 7;

interface ApplicationFormProps {
  initialValue?: Application | null;
  onSubmit: (values: ApplicationInput) => Promise<void>;
  onCancel: () => void;
  cvSummary?: string | null;
}

const emptyValue: ApplicationInput = {
  company: "",
  role: "",
  offer_url: "",
  applied_at: "",
  status: "a_candidater",
  linkedin_contact: "",
  contact_email: "",
  next_followup_at: "",
  comment: "",
  job_description: "",
};

export function ApplicationForm({ initialValue, onSubmit, onCancel, cvSummary }: ApplicationFormProps) {
  const [values, setValues] = useState<ApplicationInput>(
    initialValue
      ? {
          company: initialValue.company,
          role: initialValue.role,
          offer_url: initialValue.offer_url ?? "",
          applied_at: initialValue.applied_at ?? "",
          status: initialValue.status,
          linkedin_contact: initialValue.linkedin_contact ?? "",
          contact_email: initialValue.contact_email ?? "",
          next_followup_at: initialValue.next_followup_at ?? "",
          comment: initialValue.comment ?? "",
          job_description: initialValue.job_description ?? "",
        }
      : emptyValue
  );
  const [loading, setLoading] = useState(false);
  // Par défaut, on ne montre que l'essentiel. En modification, on ouvre directement
  // le détail puisque des informations y sont probablement déjà renseignées.
  const [showDetails, setShowDetails] = useState(Boolean(initialValue));

  const [emailDomain, setEmailDomain] = useState("");
  const [findingEmail, setFindingEmail] = useState(false);
  const [emailBest, setEmailBest] = useState<string | null>(null);
  const [emailAlternatives, setEmailAlternatives] = useState<string[]>([]);
  const [emailConfidence, setEmailConfidence] = useState<"estimee" | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [fetchingOffer, setFetchingOffer] = useState(false);
  const [fetchOfferError, setFetchOfferError] = useState<string | null>(null);
  const [fetchOfferSuccess, setFetchOfferSuccess] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{ score: number; strengths: string[]; gaps: string[]; usedRealAi: boolean } | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  function update<K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFindEmail() {
    setEmailError(null);
    setEmailAlternatives([]);
    setEmailConfidence(null);
    setEmailBest(null);
    setCopiedAll(false);

    const nameParts = (values.linkedin_contact ?? "").trim().split(/\s+/);
    if (!emailDomain.trim()) {
      setEmailError("Renseignez le domaine du site de l'entreprise (ex : entreprise.fr).");
      return;
    }
    if (nameParts.length < 2) {
      setEmailError("Renseignez le prénom et le nom du contact dans le champ ci-dessus (ex : Sophie Martin).");
      return;
    }

    const [firstName, ...rest] = nameParts;
    const lastName = rest.join(" ");

    setFindingEmail(true);
    try {
      const res = await fetch("/api/find-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain: emailDomain, firstName, lastName }),
      });
      const data = await res.json();

      if (!res.ok) {
        setEmailError(data.error || "Recherche impossible.");
        return;
      }

      update("contact_email", data.best.email);
      setEmailBest(data.best.email);
      setEmailConfidence(data.best.confidence);
      setEmailAlternatives(data.alternatives ?? []);
    } catch {
      setEmailError("Une erreur est survenue lors de la recherche.");
    } finally {
      setFindingEmail(false);
    }
  }

  async function handleCopyAllEmails() {
    const allEmails = [emailBest, ...emailAlternatives].filter(Boolean) as string[];
    if (allEmails.length === 0) return;
    await navigator.clipboard.writeText(allEmails.join(", "));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  }

  async function handleFetchOffer() {
    setFetchOfferError(null);
    setFetchOfferSuccess(false);

    if (!values.offer_url) {
      setFetchOfferError("Renseignez d'abord le lien de l'offre ci-dessus.");
      return;
    }

    setFetchingOffer(true);
    try {
      const res = await fetch("/api/fetch-offer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: values.offer_url }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFetchOfferError(data.error || "Récupération impossible.");
        return;
      }

      update("job_description", data.text);
      setFetchOfferSuccess(true);
      setShowDetails(true);
    } catch {
      setFetchOfferError("Une erreur est survenue. Copiez-collez le texte de l'offre manuellement.");
    } finally {
      setFetchingOffer(false);
    }
  }

  async function handleMatchScore() {
    setMatchError(null);
    setMatchResult(null);

    if (!cvSummary) {
      setMatchError("Déposez d'abord votre CV dans votre profil pour utiliser cette analyse.");
      return;
    }
    if (!values.job_description) {
      setMatchError("Renseignez d'abord la description de l'offre ci-dessus.");
      return;
    }

    setMatching(true);
    try {
      const res = await fetch("/api/match-score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cvSummary, jobDescription: values.job_description }),
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...values,
        offer_url: values.offer_url || null,
        applied_at: values.applied_at || null,
        linkedin_contact: values.linkedin_contact || null,
        contact_email: values.contact_email || null,
        next_followup_at: values.next_followup_at || null,
        comment: values.comment || null,
        job_description: values.job_description || null,
      } as ApplicationInput);
    } finally {
      setLoading(false);
    }
  }

  const allFoundEmails = [emailBest, ...emailAlternatives].filter(Boolean) as string[];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* --- Essentiel : le strict minimum pour ajouter une candidature en quelques secondes --- */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="company">Entreprise *</Label>
          <Input
            id="company"
            required
            value={values.company}
            onChange={(e) => update("company", e.target.value)}
            placeholder="Ex : Lumeo Digital"
          />
        </div>
        <div>
          <Label htmlFor="role">Poste *</Label>
          <Input
            id="role"
            required
            value={values.role}
            onChange={(e) => update("role", e.target.value)}
            placeholder="Ex : Alternant marketing digital"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Statut</Label>
        <Select
          id="status"
          value={values.status}
          onChange={(e) => update("status", e.target.value as ApplicationInput["status"])}
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>

      {!showDetails && (
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="text-sm font-medium text-primary hover:underline"
        >
          + Ajouter plus de détails (optionnel : offre, contact, relance, description...)
        </button>
      )}

      {/* --- Optionnel : tout le reste, replié par défaut pour ne pas alourdir l'ajout --- */}
      {showDetails && (
        <div className="space-y-4 rounded-2xl border border-line bg-paper/40 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Détails complémentaires (optionnel)</p>
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="text-xs font-medium text-muted hover:text-ink"
            >
              Masquer
            </button>
          </div>

          <div>
            <Label htmlFor="offer_url">Lien de l&apos;offre</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="offer_url"
                type="url"
                value={values.offer_url ?? ""}
                onChange={(e) => update("offer_url", e.target.value)}
                placeholder="https://..."
                className="flex-1 min-w-[200px]"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleFetchOffer} disabled={fetchingOffer}>
                {fetchingOffer ? "Lecture..." : "↓ Récupérer automatiquement"}
              </Button>
            </div>
            {fetchOfferError && <p className="mt-1.5 text-xs text-warn">{fetchOfferError}</p>}
            {fetchOfferSuccess && (
              <p className="mt-1.5 text-xs text-success">
                ✓ Texte récupéré et ajouté dans "Description de l&apos;offre" ci-dessous — vérifiez qu&apos;il est correct.
              </p>
            )}
            <FieldHint>
              Fonctionne sur la plupart des pages carrière d&apos;entreprise. Ne fonctionne pas sur LinkedIn, Indeed ou
              Welcome to the Jungle (ces sites bloquent la récupération automatique) : collez le texte manuellement dans ce cas.
            </FieldHint>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="applied_at">Date de candidature</Label>
              <Input
                id="applied_at"
                type="date"
                value={values.applied_at ?? ""}
                onChange={(e) => {
                  const newDate = e.target.value;
                  update("applied_at", newDate);
                  // Suggère automatiquement une date de relance si elle n'a pas déjà été fixée manuellement
                  if (newDate && !values.next_followup_at) {
                    update("next_followup_at", addBusinessDays(newDate, RECOMMENDED_FOLLOWUP_DAYS));
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="next_followup_at">Date de relance prévue</Label>
              <Input
                id="next_followup_at"
                type="date"
                value={values.next_followup_at ?? ""}
                onChange={(e) => update("next_followup_at", e.target.value)}
              />
              <FieldHint>
                Suggérée automatiquement à {RECOMMENDED_FOLLOWUP_DAYS} jours ouvrés après la candidature (modifiable).
              </FieldHint>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="linkedin_contact">Contact (nom du recruteur)</Label>
              <Input
                id="linkedin_contact"
                value={values.linkedin_contact ?? ""}
                onChange={(e) => update("linkedin_contact", e.target.value)}
                placeholder="Ex : Sophie Martin"
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Email du contact</Label>
              <Input
                id="contact_email"
                type="email"
                value={values.contact_email ?? ""}
                onChange={(e) => update("contact_email", e.target.value)}
                placeholder="contact@entreprise.com"
              />
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-line bg-white p-4">
            <p className="text-sm font-medium text-ink">🔍 Trouver l&apos;email du contact</p>
            <p className="mt-1 text-xs text-muted">
              Renseignez le nom du contact ci-dessus, puis le domaine du site de l&apos;entreprise.
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[180px]">
                <Label htmlFor="email_domain">Domaine de l&apos;entreprise</Label>
                <Input
                  id="email_domain"
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                  placeholder="Ex : bnpparibas.fr"
                />
              </div>
              <Button type="button" variant="secondary" onClick={handleFindEmail} disabled={findingEmail}>
                {findingEmail ? "Recherche..." : "Trouver l'email"}
              </Button>
            </div>

            {emailError && <p className="mt-2 text-xs text-danger">{emailError}</p>}

            {emailConfidence && (
              <div className="mt-3 rounded-lg bg-paper/60 p-3">
                <p className="text-xs font-medium text-warn">
                  ⚠ Adresse estimée à partir des schémas les plus courants (non vérifiée), insérée dans le champ ci-dessus. Vérifiez-la avant tout envoi important.
                </p>

                {allFoundEmails.length > 1 && (
                  <div className="mt-2 rounded-lg bg-primary-50 p-3">
                    <p className="text-xs text-primary-600">
                      Vous n&apos;êtes pas sûr du bon format ? Vous pouvez copier ces {allFoundEmails.length} adresses et les
                      mettre en copie cachée (Cci) de votre mail. À utiliser avec parcimonie : évitez d&apos;en abuser sur une
                      même entreprise, au risque de ressembler à du spam.
                    </p>
                    <Button type="button" size="sm" variant="secondary" className="mt-2" onClick={handleCopyAllEmails}>
                      {copiedAll ? "Copié ✓" : `Copier les ${allFoundEmails.length} adresses (pour le Cci)`}
                    </Button>
                  </div>
                )}

                {emailAlternatives.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted">Ou choisissez une adresse précise :</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {emailAlternatives.map((alt) => (
                        <button
                          type="button"
                          key={alt}
                          onClick={() => update("contact_email", alt)}
                          className="rounded-full border border-line px-2.5 py-1 text-xs text-ink/80 hover:border-primary-200 hover:bg-primary-50"
                        >
                          {alt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="job_description">Description de l&apos;offre</Label>
            <Textarea
              id="job_description"
              value={values.job_description ?? ""}
              onChange={(e) => update("job_description", e.target.value)}
              placeholder="Collez ici le texte complet de l'offre (missions, profil recherché...)."
              className="min-h-[120px]"
            />
            <FieldHint>Utilisée automatiquement par le générateur de messages IA si vous liez cette candidature.</FieldHint>
          </div>

          <div className="rounded-xl border border-dashed border-line bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-ink">🎯 Score de correspondance avec mon CV</p>
                <p className="mt-1 text-xs text-muted">
                  {cvSummary
                    ? "Compare votre profil à cette offre pour évaluer vos chances et repérer ce qui manque."
                    : "Déposez votre CV dans votre profil pour activer cette analyse."}
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={handleMatchScore} disabled={matching || !cvSummary}>
                {matching ? "Analyse..." : "Analyser"}
              </Button>
            </div>

            {matchError && <p className="mt-2 text-xs text-danger">{matchError}</p>}

            {matchResult && (
              <div className="mt-3 rounded-lg bg-paper/60 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        matchResult.score >= 70 ? "bg-success" : matchResult.score >= 40 ? "bg-warn" : "bg-danger"
                      )}
                      style={{ width: `${matchResult.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-ink">{matchResult.score}%</span>
                </div>

                {matchResult.strengths.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-success">Points forts</p>
                    <ul className="mt-1 space-y-1">
                      {matchResult.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-ink/80">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {matchResult.gaps.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-warn">À renforcer ou mentionner</p>
                    <ul className="mt-1 space-y-1">
                      {matchResult.gaps.map((g, i) => (
                        <li key={i} className="text-xs text-ink/80">• {g}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {!matchResult.usedRealAi && (
                  <p className="mt-3 text-xs text-muted">
                    Estimation simplifiée basée sur des mots-clés (aucune clé IA configurée) — le résultat avec Claude actif est plus fiable.
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="comment">Commentaire</Label>
            <Textarea
              id="comment"
              value={values.comment ?? ""}
              onChange={(e) => update("comment", e.target.value)}
              placeholder="Notes libres sur cette candidature..."
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2.5 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : initialValue ? "Enregistrer" : "Ajouter la candidature"}
        </Button>
      </div>
    </form>
  );
}
