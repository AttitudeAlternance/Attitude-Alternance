"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, Select, FieldHint } from "@/components/ui/Form";
import { APPLICATION_STATUSES, STATUS_LABELS, type Application, type ApplicationInput } from "@/lib/types";

interface ApplicationFormProps {
  initialValue?: Application | null;
  onSubmit: (values: ApplicationInput) => Promise<void>;
  onCancel: () => void;
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

export function ApplicationForm({ initialValue, onSubmit, onCancel }: ApplicationFormProps) {
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
  const [emailDomain, setEmailDomain] = useState("");
  const [findingEmail, setFindingEmail] = useState(false);
  const [emailAlternatives, setEmailAlternatives] = useState<string[]>([]);
  const [emailConfidence, setEmailConfidence] = useState<"verifiee" | "estimee" | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  function update<K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFindEmail() {
    setEmailError(null);
    setEmailAlternatives([]);
    setEmailConfidence(null);

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
      setEmailConfidence(data.best.confidence);
      setEmailAlternatives(data.alternatives ?? []);
    } catch {
      setEmailError("Une erreur est survenue lors de la recherche.");
    } finally {
      setFindingEmail(false);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="offer_url">Lien de l&apos;offre</Label>
        <Input
          id="offer_url"
          type="url"
          value={values.offer_url ?? ""}
          onChange={(e) => update("offer_url", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="applied_at">Date de candidature</Label>
          <Input
            id="applied_at"
            type="date"
            value={values.applied_at ?? ""}
            onChange={(e) => update("applied_at", e.target.value)}
          />
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="linkedin_contact">Contact LinkedIn</Label>
          <Input
            id="linkedin_contact"
            value={values.linkedin_contact ?? ""}
            onChange={(e) => update("linkedin_contact", e.target.value)}
            placeholder="Nom du recruteur"
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

      <div className="rounded-xl border border-dashed border-line bg-paper/60 p-4">
        <p className="text-sm font-medium text-ink">🔍 Trouver l&apos;email du contact</p>
        <p className="mt-1 text-xs text-muted">
          Renseignez le prénom et nom du contact ci-dessus, puis le domaine du site de l&apos;entreprise.
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
          <div className="mt-3 rounded-lg bg-white p-3">
            <p className="text-xs font-medium text-ink">
              {emailConfidence === "verifiee" ? (
                <span className="text-success">✓ Adresse trouvée et vérifiée — insérée dans le champ ci-dessus.</span>
              ) : (
                <span className="text-warn">
                  ⚠ Adresse estimée à partir des schémas d&apos;emails les plus courants (non vérifiée) — insérée dans le champ ci-dessus, à confirmer avant envoi.
                </span>
              )}
            </p>
            {emailAlternatives.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted">Autres possibilités :</p>
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
        <Label htmlFor="next_followup_at">Date de relance prévue</Label>
        <Input
          id="next_followup_at"
          type="date"
          value={values.next_followup_at ?? ""}
          onChange={(e) => update("next_followup_at", e.target.value)}
        />
        <FieldHint>Cette candidature sera mise en évidence à cette date si aucune réponse n&apos;a été notée.</FieldHint>
      </div>

      <div>
        <Label htmlFor="job_description">Description de l&apos;offre</Label>
        <Textarea
          id="job_description"
          value={values.job_description ?? ""}
          onChange={(e) => update("job_description", e.target.value)}
          placeholder="Collez ici le texte complet de l'offre trouvée sur le site d'emploi (missions, profil recherché...)."
          className="min-h-[140px]"
        />
        <FieldHint>
          Cette description sera automatiquement proposée au générateur de messages IA lorsque vous lierez cette candidature, pour des messages plus pertinents.
        </FieldHint>
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
