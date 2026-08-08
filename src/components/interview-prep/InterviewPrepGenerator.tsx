"use client";

import { useState, type ReactNode } from "react";
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

type SectionKey =
  | "revele"
  | "axe"
  | "poste"
  | "vigilance"
  | "pitch"
  | "pointsForts"
  | "astuces"
  | "questionsProbables"
  | "questionsRecruteur";

// Ordre de lecture : analyse de l'annonce -> positionnement -> contexte du poste
// -> risques à anticiper -> pitch -> reste des atouts -> préparation pratique -> questions.
const SECTION_ORDER: SectionKey[] = [
  "revele",
  "axe",
  "poste",
  "vigilance",
  "pitch",
  "pointsForts",
  "astuces",
  "questionsProbables",
  "questionsRecruteur",
];

// Seule la première section (l'analyse de l'annonce) est ouverte par défaut :
// l'essentiel (axe différenciant, point de vigilance, astuce) est déjà visible
// dans le bandeau résumé au-dessus, donc pas besoin de tout dérouler d'entrée.
function defaultOpenSections(): Record<SectionKey, boolean> {
  return {
    revele: true,
    axe: false,
    poste: false,
    vigilance: false,
    pitch: false,
    pointsForts: false,
    astuces: false,
    questionsProbables: false,
    questionsRecruteur: false,
  };
}

export function InterviewPrepGenerator({ profile, applications }: InterviewPrepGeneratorProps) {
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [prep, setPrep] = useState<InterviewPrep | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedRealAi, setUsedRealAi] = useState(true);
  const [copied, setCopied] = useState(false);
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(defaultOpenSections());

  const selectedApp = applications.find((a) => a.id === selectedApplicationId) ?? null;

  function toggleSection(key: SectionKey) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function openSectionAndScroll(key: SectionKey) {
    setOpenSections((prev) => ({ ...prev, [key]: true }));
    // Laisse le temps au contenu de s'afficher avant de scroller dessus.
    setTimeout(() => {
      document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function toggleAllSections() {
    const anyClosed = SECTION_ORDER.some((key) => !openSections[key]);
    const next = {} as Record<SectionKey, boolean>;
    SECTION_ORDER.forEach((key) => {
      next[key] = anyClosed;
    });
    setOpenSections(next);
  }

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
      setOpenSections(defaultOpenSections());
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
      ...prep.besoinsImplicites.map((item) =>
        item.extrait ? `- « ${item.extrait} » → ${item.interpretation}` : `- ${item.interpretation}`
      ),
      "",
      "VOTRE AXE DIFFÉRENCIANT",
      prep.axeDifferenciant,
      "",
      "LE POSTE EN BREF",
      prep.syntheseAnnonce,
      "",
      "POINTS DE VIGILANCE À ANTICIPER",
      ...prep.pointsDeVigilance.map((item) => `- Écart : ${item.ecart}\n  Comment y répondre : ${item.conseil}`),
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
            setOpenSections(defaultOpenSections());
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

          {/* Bandeau résumé : l'essentiel en un coup d'œil, avant de dérouler le détail */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <SummaryPill
              icon="⭐"
              label="Votre axe"
              text={prep.axeDifferenciant}
              className="border-primary-200 bg-primary-50 text-primary-600"
              onClick={() => openSectionAndScroll("axe")}
            />
            <SummaryPill
              icon="⚠️"
              label="À anticiper"
              text={prep.pointsDeVigilance[0]?.ecart || "Rien de particulier à signaler pour ce poste."}
              className="border-warn/40 bg-warn-50 text-ink"
              onClick={() => openSectionAndScroll("vigilance")}
            />
            <SummaryPill
              icon="💡"
              label="Astuce clé"
              text={prep.astuces[0] || ""}
              className="border-accent-100 bg-accent-50 text-ink"
              onClick={() => openSectionAndScroll("astuces")}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={toggleAllSections}
              className="text-xs font-medium text-primary hover:underline"
            >
              {SECTION_ORDER.some((key) => !openSections[key]) ? "Tout déplier" : "Tout réduire"}
            </button>
          </div>

          <AccordionSection
            id="section-revele"
            title="🔎 Ce que l'annonce révèle vraiment"
            badge={`${prep.besoinsImplicites.length} passage${prep.besoinsImplicites.length > 1 ? "s" : ""}`}
            isOpen={openSections.revele}
            onToggle={() => toggleSection("revele")}
          >
            <ul className="space-y-3 text-sm text-ink/85">
              {prep.besoinsImplicites.map((item, i) => (
                <li key={i} className="border-l-2 border-primary-200 pl-3">
                  {item.extrait && <p className="italic text-ink/60">&laquo; {item.extrait} &raquo;</p>}
                  <p className={item.extrait ? "mt-1" : ""}>{item.interpretation}</p>
                </li>
              ))}
            </ul>
          </AccordionSection>

          <AccordionSection
            id="section-axe"
            title="⭐ Votre axe différenciant"
            isOpen={openSections.axe}
            onToggle={() => toggleSection("axe")}
            emphasis
          >
            <p className="text-sm font-medium text-ink">{prep.axeDifferenciant}</p>
          </AccordionSection>

          <AccordionSection
            id="section-poste"
            title="🏢 Le poste en bref"
            isOpen={openSections.poste}
            onToggle={() => toggleSection("poste")}
          >
            <p className="text-sm text-ink/85">{prep.syntheseAnnonce}</p>
          </AccordionSection>

          {prep.pointsDeVigilance.length > 0 && (
            <AccordionSection
              id="section-vigilance"
              title="⚠️ Points de vigilance à anticiper"
              badge={String(prep.pointsDeVigilance.length)}
              isOpen={openSections.vigilance}
              onToggle={() => toggleSection("vigilance")}
              warn
            >
              <ul className="space-y-3 text-sm text-ink/85">
                {prep.pointsDeVigilance.map((item, i) => (
                  <li key={i}>
                    <p className="font-medium text-ink">{item.ecart}</p>
                    <p className="mt-1 text-ink/75">→ {item.conseil}</p>
                  </li>
                ))}
              </ul>
            </AccordionSection>
          )}

          <AccordionSection
            id="section-pitch"
            title="🎤 Votre pitch"
            isOpen={openSections.pitch}
            onToggle={() => toggleSection("pitch")}
          >
            <p className="text-sm italic text-ink/85">{prep.pitch}</p>
          </AccordionSection>

          <AccordionSection
            id="section-pointsForts"
            title="💪 Vos autres points forts"
            badge={String(prep.pointsForts.length)}
            isOpen={openSections.pointsForts}
            onToggle={() => toggleSection("pointsForts")}
          >
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink/85">
              {prep.pointsForts.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </AccordionSection>

          <AccordionSection
            id="section-astuces"
            title="💡 Astuces qui peuvent faire la différence"
            badge={String(prep.astuces.length)}
            isOpen={openSections.astuces}
            onToggle={() => toggleSection("astuces")}
          >
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink/85">
              {prep.astuces.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </AccordionSection>

          <AccordionSection
            id="section-questionsProbables"
            title="❓ Questions probables"
            badge={String(prep.questionsProbables.length)}
            isOpen={openSections.questionsProbables}
            onToggle={() => toggleSection("questionsProbables")}
          >
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink/85">
              {prep.questionsProbables.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </AccordionSection>

          <AccordionSection
            id="section-questionsRecruteur"
            title="🎯 Questions à poser au recruteur"
            badge={String(prep.questionsARecruteur.length)}
            isOpen={openSections.questionsRecruteur}
            onToggle={() => toggleSection("questionsRecruteur")}
          >
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink/85">
              {prep.questionsARecruteur.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </AccordionSection>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Bandeau résumé : 3 pastilles cliquables donnant l'essentiel en un coup d'œil,
// tronquées à 2 lignes (le détail complet reste dans la section correspondante).
// ----------------------------------------------------------------------------
function SummaryPill({
  icon,
  label,
  text,
  className,
  onClick,
}: {
  icon: string;
  label: string;
  text: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-3 text-left text-xs leading-snug shadow-card transition-shadow hover:shadow-pop ${className}`}
    >
      <span className="mb-1 flex items-center gap-1.5 font-semibold">
        <span>{icon}</span>
        <span>{label}</span>
      </span>
      <span className="line-clamp-2 block">{text}</span>
    </button>
  );
}

// ----------------------------------------------------------------------------
// Section repliable générique utilisée pour chaque bloc du dossier de préparation.
// ----------------------------------------------------------------------------
function AccordionSection({
  id,
  title,
  badge,
  isOpen,
  onToggle,
  children,
  emphasis,
  warn,
}: {
  id: string;
  title: string;
  badge?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  emphasis?: boolean;
  warn?: boolean;
}) {
  const containerClass = emphasis
    ? "rounded-2xl border-2 border-primary bg-primary-50"
    : warn
      ? "rounded-2xl border border-warn/40 bg-warn-50"
      : "rounded-2xl border border-line bg-white";

  return (
    <div id={id} className={`overflow-hidden shadow-card scroll-mt-4 ${containerClass}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left"
      >
        <span
          className={`font-display text-sm font-semibold ${emphasis ? "text-primary-600" : "text-ink"}`}
        >
          {title}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {badge && (
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-muted">{badge}</span>
          )}
          <span
            className={`text-xs text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            aria-hidden
          >
            ▾
          </span>
        </span>
      </button>
      {isOpen && <div className="px-6 pb-6 -mt-1">{children}</div>}
    </div>
  );
}
