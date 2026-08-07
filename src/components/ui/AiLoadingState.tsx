"use client";

import { useEffect, useState } from "react";

interface AiLoadingStateProps {
  /** Message principal, contextuel à ce qui est en train d'être généré. */
  message: string;
  /** Petites étapes optionnelles qui défilent pour rendre l'attente plus vivante. */
  steps?: string[];
}

/**
 * État d'attente animé pour toutes les actions qui appellent l'IA (message,
 * score de correspondance, vérification d'offre, préparation d'entretien,
 * lecture de CV...). À afficher à la place — ou en complément — du bouton
 * pendant le chargement, plutôt qu'un simple texte "Génération en cours...".
 */
export function AiLoadingState({ message, steps }: AiLoadingStateProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!steps || steps.length === 0) return;
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % steps.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [steps]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-primary-50/60 px-6 py-10 text-center">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <span className="absolute h-12 w-12 animate-ping rounded-full bg-primary-200 opacity-75" />
        <span className="relative flex h-9 w-9 animate-pulse items-center justify-center rounded-full bg-primary text-base text-white">
          ✨
        </span>
      </div>
      <p className="text-sm font-medium text-ink">{message}</p>
      {steps && steps.length > 0 && (
        <p key={stepIndex} className="text-xs text-muted">
          {steps[stepIndex]}
        </p>
      )}
    </div>
  );
}
