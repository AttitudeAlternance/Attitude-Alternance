"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, FieldHint } from "@/components/ui/Form";
import type { Profile } from "@/lib/types";

interface ProfileFormProps {
  userId: string;
  email: string;
  initialProfile: Profile | null;
}

type ProfileFields = Pick<
  Profile,
  | "first_name"
  | "last_name"
  | "formation"
  | "target_city"
  | "target_sector"
  | "target_role"
  | "linkedin_url"
  | "cv_url"
  | "goal"
>;

const fieldLabels: Record<keyof ProfileFields, string> = {
  first_name: "Prénom",
  last_name: "Nom",
  formation: "Formation en cours",
  target_city: "Ville recherchée",
  target_sector: "Secteur recherché",
  target_role: "Type de poste recherché",
  linkedin_url: "Lien LinkedIn",
  cv_url: "CV (lien externe)",
  goal: "Objectif d'alternance",
};

export function ProfileForm({ userId, email, initialProfile }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFields>({
    first_name: initialProfile?.first_name ?? "",
    last_name: initialProfile?.last_name ?? "",
    formation: initialProfile?.formation ?? "",
    target_city: initialProfile?.target_city ?? "",
    target_sector: initialProfile?.target_sector ?? "",
    target_role: initialProfile?.target_role ?? "",
    linkedin_url: initialProfile?.linkedin_url ?? "",
    cv_url: initialProfile?.cv_url ?? "",
    goal: initialProfile?.goal ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const completion = useMemo(() => {
    const keys = Object.keys(fieldLabels) as (keyof ProfileFields)[];
    const filled = keys.filter((k) => (values[k] ?? "").toString().trim().length > 0).length;
    return Math.round((filled / keys.length) * 100);
  }, [values]);

  function update<K extends keyof ProfileFields>(key: K, value: ProfileFields[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error } = await supabase.from("profiles").upsert({ id: userId, ...values });

    setSaving(false);
    if (error) {
      setError("Impossible d'enregistrer votre profil pour le moment.");
      return;
    }
    setSaved(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={email} disabled className="bg-paper text-muted" />
            <FieldHint>L&apos;email ne peut pas être modifié ici.</FieldHint>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="first_name">{fieldLabels.first_name}</Label>
              <Input id="first_name" value={values.first_name ?? ""} onChange={(e) => update("first_name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="last_name">{fieldLabels.last_name}</Label>
              <Input id="last_name" value={values.last_name ?? ""} onChange={(e) => update("last_name", e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="formation">{fieldLabels.formation}</Label>
            <Input
              id="formation"
              value={values.formation ?? ""}
              onChange={(e) => update("formation", e.target.value)}
              placeholder="Ex : BUT Marketing Digital, 2e année"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="target_city">{fieldLabels.target_city}</Label>
              <Input id="target_city" value={values.target_city ?? ""} onChange={(e) => update("target_city", e.target.value)} placeholder="Ex : Bordeaux" />
            </div>
            <div>
              <Label htmlFor="target_sector">{fieldLabels.target_sector}</Label>
              <Input id="target_sector" value={values.target_sector ?? ""} onChange={(e) => update("target_sector", e.target.value)} placeholder="Ex : Marketing digital" />
            </div>
          </div>

          <div>
            <Label htmlFor="target_role">{fieldLabels.target_role}</Label>
            <Input
              id="target_role"
              value={values.target_role ?? ""}
              onChange={(e) => update("target_role", e.target.value)}
              placeholder="Ex : Chargé(e) de communication"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="linkedin_url">{fieldLabels.linkedin_url}</Label>
              <Input id="linkedin_url" type="url" value={values.linkedin_url ?? ""} onChange={(e) => update("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <Label htmlFor="cv_url">{fieldLabels.cv_url}</Label>
              <Input id="cv_url" type="url" value={values.cv_url ?? ""} onChange={(e) => update("cv_url", e.target.value)} placeholder="Lien Google Drive, Canva..." />
            </div>
          </div>

          <div>
            <Label htmlFor="goal">{fieldLabels.goal}</Label>
            <Textarea
              id="goal"
              value={values.goal ?? ""}
              onChange={(e) => update("goal", e.target.value)}
              placeholder="Décrivez en quelques lignes le poste et le rythme d'alternance recherchés."
            />
          </div>

          {error && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer mon profil"}
            </Button>
            {saved && <span className="text-sm font-medium text-success">Profil enregistré ✓</span>}
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-base font-semibold text-ink">Complétion du profil</h2>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="mt-2 text-sm font-medium text-ink">{completion}% complété</p>
        {completion < 100 ? (
          <p className="mt-2 text-sm text-muted">
            Un profil complet permet au générateur IA de produire des messages plus personnalisés.
          </p>
        ) : (
          <p className="mt-2 text-sm text-success">Votre profil est complet, bravo !</p>
        )}
      </Card>
    </div>
  );
}
