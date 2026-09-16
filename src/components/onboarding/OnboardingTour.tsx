"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface OnboardingTourProps {
  userId: string;
  // true si l'étudiant a déjà terminé ou passé le guide par le passé (colonne
  // profiles.onboarding_dismissed_at non vide) : dans ce cas on ne le relance
  // pas automatiquement, seul le lien "Revoir le guide" (page Mon profil) peut
  // le redéclencher.
  initialDismissed: boolean;
}

// Chaque étape a deux temps : "nav" (on éclaire le lien du menu correspondant)
// puis "explain" (une fois sur la page, on éclaire l'élément concret à utiliser
// et on explique quoi en faire).
type TourPhase = "nav" | "explain";

interface TourStep {
  navId: string;
  pageId: string;
  href: string;
  navTitle: string;
  navDescription: string;
  pageTitle: string;
  pageDescription: string;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Déclenché par le lien "Revoir le guide de démarrage" (page Mon profil) pour
// relancer le tunnel à la demande, sans avoir besoin d'un contexte React
// partagé entre le layout et les pages enfants.
export const RESTART_ONBOARDING_TOUR_EVENT = "aa:restart-onboarding-tour";

const TOUR_STEPS: TourStep[] = [
  {
    navId: "profile",
    pageId: "profile-cv",
    href: "/dashboard/profile",
    navTitle: "Commence par ton profil",
    navDescription: "On personnalise d'abord ton compte.",
    pageTitle: "Dépose ton CV et complète tes infos",
    pageDescription:
      "Ton CV est analysé pour personnaliser automatiquement tes messages générés par IA. Complète aussi les informations juste en dessous.",
  },
  {
    navId: "import-express",
    pageId: "import-express-bookmarklet",
    href: "/dashboard/import-express",
    navTitle: "Ajoute une offre en 20 secondes",
    navDescription: "Un raccourci pour importer n'importe quelle offre trouvée en ligne.",
    pageTitle: "Glisse ce bouton dans tes favoris",
    pageDescription:
      "Une fois installé, un clic sur ce bouton depuis n'importe quelle offre (LinkedIn, Indeed...) ouvre directement l'ajout de candidature, déjà pré-rempli.",
  },
  {
    navId: "applications",
    pageId: "applications-add",
    href: "/dashboard/applications",
    navTitle: "Suis tes candidatures",
    navDescription: "Centralise ici toutes tes candidatures.",
    pageTitle: "Ajoute ta première candidature",
    pageDescription: "Clique ici pour en enregistrer une : une date de relance sera programmée automatiquement.",
  },
  {
    navId: "messages",
    pageId: "messages-page",
    href: "/dashboard/messages",
    navTitle: "Génère un message personnalisé",
    navDescription: "Un mail ou message LinkedIn prêt à copier-coller.",
    pageTitle: "Crée ton premier message",
    pageDescription: "Choisis une candidature et génère en quelques secondes un message adapté à l'offre.",
  },
  {
    navId: "interview-prep",
    pageId: "interview-prep-page",
    href: "/dashboard/interview-prep",
    navTitle: "Prépare tes entretiens",
    navDescription: "Synthèse de l'annonce, pitch et questions probables.",
    pageTitle: "Prépare ton prochain entretien",
    pageDescription: "Sélectionne une candidature pour générer une préparation d'entretien sur mesure.",
  },
];

export function OnboardingTour({ userId, initialDismissed }: OnboardingTourProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<TourPhase>("nav");
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Démarrage automatique une seule fois, si l'étudiant n'a jamais terminé/passé le guide.
  useEffect(() => {
    if (!initialDismissed) {
      setOpen(true);
      setStep(0);
      setPhase("nav");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Relance à la demande depuis "Mon profil" (bouton "Revoir le guide de démarrage").
  useEffect(() => {
    function handleRestart() {
      setStep(0);
      setPhase("nav");
      setOpen(true);
    }
    window.addEventListener(RESTART_ONBOARDING_TOUR_EVENT, handleRestart);
    return () => window.removeEventListener(RESTART_ONBOARDING_TOUR_EVENT, handleRestart);
  }, []);

  const currentStep = TOUR_STEPS[step] as TourStep | undefined;
  const currentTargetId = phase === "nav" ? currentStep?.navId : currentStep?.pageId;

  const updateRect = useCallback(() => {
    if (!currentTargetId) {
      setRect(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(`[data-tour-id="${currentTargetId}"]`);
    if (!el) {
      setRect(null);
      return;
    }
    const box = el.getBoundingClientRect();
    // Élément présent dans le DOM mais non affiché (ex : sidebar cachée sur mobile,
    // "hidden lg:block") : on n'affiche pas le tunnel dans ce cas, plutôt qu'un
    // encadré dégénéré en haut à gauche de l'écran.
    if (box.width === 0 && box.height === 0) {
      setRect(null);
      return;
    }
    setRect({ top: box.top, left: box.left, width: box.width, height: box.height });
  }, [currentTargetId]);

  useLayoutEffect(() => {
    if (!open) return;
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [open, updateRect]);

  // Juste après une navigation (déclenchée par le tunnel ou par un clic manuel sur le
  // vrai lien), l'élément ciblé sur la nouvelle page peut mettre un instant à apparaître :
  // on réessaie régulièrement tant qu'on ne l'a pas trouvé.
  useEffect(() => {
    if (!open || rect) return;
    const interval = window.setInterval(updateRect, 200);
    return () => window.clearInterval(interval);
  }, [open, rect, updateRect]);

  // Si l'étudiant clique directement sur le vrai lien du menu (plutôt que sur "Suivant"),
  // on passe automatiquement à l'explication dès qu'il arrive sur la bonne page.
  useEffect(() => {
    if (!open || !currentStep || phase !== "nav") return;
    if (pathname === currentStep.href) {
      setPhase("explain");
    }
  }, [pathname, open, phase, currentStep]);

  async function persistDismissal() {
    if (!userId) return;
    try {
      await supabase
        .from("profiles")
        .update({ onboarding_dismissed_at: new Date().toISOString() })
        .eq("id", userId);
    } catch {
      // Pas bloquant pour l'étudiant : au pire le guide se réaffichera à la prochaine connexion.
    }
  }

  function handleNext() {
    if (!currentStep) return;
    if (phase === "nav") {
      router.push(currentStep.href);
      setPhase("explain");
      return;
    }
    // phase === "explain"
    if (step >= TOUR_STEPS.length - 1) {
      setOpen(false);
      void persistDismissal();
      return;
    }
    setStep((s) => s + 1);
    setPhase("nav");
  }

  function handleSkip() {
    setOpen(false);
    void persistDismissal();
  }

  if (!open || !currentStep || !rect) {
    return null;
  }

  const isLastExplainStep = phase === "explain" && step === TOUR_STEPS.length - 1;
  const title = phase === "nav" ? currentStep.navTitle : currentStep.pageTitle;
  const description = phase === "nav" ? currentStep.navDescription : currentStep.pageDescription;
  const tooltipWidth = 300;
  const margin = 16;
  const maxLeft = typeof window !== "undefined" ? window.innerWidth - tooltipWidth - margin : rect.left;
  const maxTop = typeof window !== "undefined" ? window.innerHeight - 220 : rect.top;
  const tooltipLeft = Math.min(rect.left + rect.width + margin, Math.max(maxLeft, margin));
  const tooltipTop = Math.min(Math.max(rect.top, margin), Math.max(maxTop, margin));

  return (
    <div className="fixed inset-0 z-40" aria-live="polite">
      {/* Bandes d'assombrissement autour de l'élément mis en avant (bloquent les clics ailleurs) */}
      <div className="fixed inset-x-0 top-0 bg-ink/55" style={{ height: Math.max(rect.top, 0) }} />
      <div className="fixed inset-x-0 bottom-0 bg-ink/55" style={{ top: rect.top + rect.height }} />
      <div className="fixed bg-ink/55" style={{ top: rect.top, height: rect.height, left: 0, width: Math.max(rect.left, 0) }} />
      <div className="fixed bg-ink/55" style={{ top: rect.top, height: rect.height, left: rect.left + rect.width, right: 0 }} />
      {/* Anneau lumineux autour de l'élément (purement visuel, ne bloque rien) */}
      <div
        className="fixed rounded-xl ring-2 ring-primary pointer-events-none"
        style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }}
      />
      {/* Bulle d'explication */}
      <div
        className="fixed z-50 rounded-2xl border border-line bg-white p-4 shadow-pop"
        style={{ top: tooltipTop, left: tooltipLeft, width: tooltipWidth }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Étape {step + 1}/{TOUR_STEPS.length}
        </p>
        <p className="mt-1 font-display text-sm font-semibold text-ink">{title}</p>
        <p className="mt-1.5 text-xs text-muted">{description}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button type="button" onClick={handleSkip} className="text-xs font-medium text-muted hover:text-ink">
            Passer
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-600"
          >
            {isLastExplainStep ? "Terminer" : "Suivant"}
          </button>
        </div>
      </div>
    </div>
  );
}
