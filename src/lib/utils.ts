import { type ClassValue, clsx } from "clsx";

// Petit wrapper autour de clsx pour composer proprement les classes Tailwind
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Formatte une date ISO (YYYY-MM-DD) en format lisible français
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Renvoie true si la date de relance est aujourd'hui
export function isDueToday(value: string | null | undefined): boolean {
  if (!value) return false;
  const today = new Date();
  const target = new Date(value);
  return (
    today.getFullYear() === target.getFullYear() &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate()
  );
}

// Renvoie true si la date de relance est dans le passé (en retard)
export function isOverdue(value: string | null | undefined): boolean {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  return target.getTime() < today.getTime();
}
