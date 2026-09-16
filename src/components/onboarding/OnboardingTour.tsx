"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface OnboardingTourProps {
  userId: string;
  // true si l'étudiant a déjà terminé ou passé le guide par le passé (colonne
  // profiles.onboarding_dismissed_at non vide) : dans ce cas on ne le relance
  // pas automatiquement, seul le lien "Revoir le guide" (page Mon profil) peut
  // le redéclencher.
  initialDismissed: boolean;
}

interface TourStep {
  id: string;
  href: string;
  title: string;
  description: string;
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

// Ordre voulu : profil d'abord (personnalisation), puis les fonctionnalités
// clés du parcours de recherche d'alternance.
const TOUR_STEPS: TourStep[] = [
  {
    id: "profile",
    href: "/dashboard/profile",
    title: "Commence par ton profil",
    description: "Renseigne tes informations pour des messages et des offres plus pertinents.",
  },
  {
    id: "import-express",
    href: "/dashboard/import-express",
    title: "Ajoute une offre en 20 secondes",
    description: "Installe le raccourci Import express pour importer n'importe quelle offre trouvée en ligne.",
  },
  {
    id: "applications",
    href: "/dashboard/applications",
    title: "Suis tes candidatures",
    description: "Centralise toutes tes candidatures ici, avec leurs relances.",
  },
  {
    id: "messages",
    href: "/dashboard/messages",
    title: "Génère un message personnalisé",
    description: "Crée en un clic un message de candidature ou de relance adapté à chaque offre.",
  },
  {
    id: "interview-prep",
    href: "/dashboard/interview-prep",
    title: "Prépare tes entretiens",
    description: "Entraîne-toi aux questions les plus posées avant le jour J.",
  },
];

export function OnboardingTour({ userId, initialDismissed }: OnboardingTourProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const pathname = usePathname();
  const supabase = createClient();
  // Évite de redéclencher l'avance automatique plusieurs fois pour la même page.
  const autoAdvancedForPath = useRef<string | null>(null);

  // Démarrage automatique une seule fois, si l'étudiant n'a jamais terminé/passé le guide.
  useEffect(() => {
    if (!initialDismissed) {
      setOpen(true);
      setStep(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Relance à la demande depuis "Mon profil" (bouton "Revoir le guide de démarrage").
  useEffect(() => {
    function handleRestart() {
      autoAdvancedForPath.current = null;
      setStep(0);
      setOpen(true);
    }
    window.addEventListener(RESTART_ONBOARDING_TOUR_EVENT, handleRestart);
    return () => window.removeEventListener(RESTART_ONBOARDING_TOUR_EVENT, handleRestart);
  }, []);

  const currentStep = TOUR_STEPS[step] as TourStep | undefined;

  const updateRect = useCallback(() => {
    if (!currentStep) {
      setRect(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(`[data-tour-id="${currentStep.id}"]`);
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
  }, [currentStep]);

  useLayoutEffect(() => {
    if (!open) return;
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [open, updateRect]);

  // Avance automatiquement à l'étape suivante quand l'étudiant a suivi le lien
  // mis en avant : signal naturel qu'il a exploré la fonctionnalité concernée.
  useEffect(() => {
    if (!open || !currentStep) return;
    if (pathname === currentStep.href && autoAdvancedForPath.current !== pathname) {
      autoAdvancedForPath.current = pathname;
      const timer = setTimeout(() => {
        goNext();
      }, 900);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, open, currentStep]);

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

  function goNext() {
    setStep((current) => {
      if (current >= TOUR_STEPS.length - 1) {
        setOpen(false);
        void persistDismissal();
        return current;
      }
      return current + 1;
    });
  }

  function handleSkip() {
    setOpen(false);
    void persistDismissal();
  }

  if (!open || !currentStep || !rect) {
    return null;
  }

  const isLast = step === TOUR_STEPS.length - 1;
  const tooltipWidth = 288;
  const margin = 16;
  const maxLeft = typeof window !== "undefined" ? window.innerWidth - tooltipWidth - margin : rect.left;
  const maxTop = typeof window !== "undefined" ? window.innerHeight - 200 : rect.top;
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
        <p className="mt-1 font-display text-sm font-semibold text-ink">{currentStep.title}</p>
        <p className="mt-1.5 text-xs text-muted">{currentStep.description}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button type="button" onClick={handleSkip} className="text-xs font-medium text-muted hover:text-ink">
            Passer
          </button>
          <button
            type="button"
            onClick={goNext}
            className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-600"
          >
            {isLast ? "Terminer" : "Suivant"}
          </button>
        </div>
      </div>
    </div>
  );
}
