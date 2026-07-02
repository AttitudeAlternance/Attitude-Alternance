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

  function update<K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
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
