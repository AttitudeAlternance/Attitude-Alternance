"use client";
import { RESTART_ONBOARDING_TOUR_EVENT } from "@/components/onboarding/OnboardingTour";

// Relance le tunnel guidé (voir OnboardingTour.tsx) sans dépendre d'un contexte
// React partagé : un simple évènement du navigateur, écouté depuis le layout.
export function RestartTourLink() {
  function handleClick() {
    window.dispatchEvent(new CustomEvent(RESTART_ONBOARDING_TOUR_EVENT));
  }
  return (
    <button type="button" onClick={handleClick} className="text-sm font-medium text-primary hover:underline">
      Revoir le guide de démarrage
    </button>
  );
}
