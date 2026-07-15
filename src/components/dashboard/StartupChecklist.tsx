import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface StartupChecklistProps {
  hasCv: boolean;
  hasApplication: boolean;
  hasMessage: boolean;
}

export function StartupChecklist({ hasCv, hasApplication, hasMessage }: StartupChecklistProps) {
  const steps = [
    {
      done: hasCv,
      label: "Déposez votre CV",
      description: "Il sera lu pour personnaliser vos messages et votre score de correspondance.",
      href: "/dashboard/profile",
      cta: "Déposer mon CV",
    },
    {
      done: hasApplication,
      label: "Ajoutez votre première candidature",
      description: "Entreprise, poste, statut — ça prend trente secondes.",
      href: "/dashboard/applications",
      cta: "Ajouter une candidature",
    },
    {
      done: hasMessage,
      label: "Générez votre premier message",
      description: "Laissez l'IA rédiger un mail de candidature déjà personnalisé.",
      href: "/dashboard/messages",
      cta: "Générer un message",
    },
  ];

  // Une fois les 3 étapes complétées, la checklist n'a plus lieu d'être affichée.
  if (steps.every((s) => s.done)) return null;

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <Card className="border-primary-200 bg-primary-50/40">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-ink">Pour bien démarrer</h2>
        <span className="text-xs font-medium text-primary-600">{doneCount}/3 étapes complétées</span>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.label}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  step.done ? "bg-success text-white" : "border-2 border-line text-transparent"
                }`}
              >
                ✓
              </span>
              <div>
                <p className={`text-sm font-medium ${step.done ? "text-muted line-through" : "text-ink"}`}>
                  {step.label}
                </p>
                {!step.done && <p className="mt-0.5 text-xs text-muted">{step.description}</p>}
              </div>
            </div>
            {!step.done && (
              <Link href={step.href}>
                <Button size="sm" variant="secondary">
                  {step.cta}
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
