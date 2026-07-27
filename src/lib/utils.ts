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

// Ajoute un nombre de jours ouvrés (lundi-vendredi) à une date, au format YYYY-MM-DD.
// Utilisé pour suggérer automatiquement une date de relance pertinente.
export function addBusinessDays(dateIso: string, businessDays: number): string {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return dateIso;

  let remaining = businessDays;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay(); // 0 = dimanche, 6 = samedi
    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }

  return date.toISOString().slice(0, 10);
}

// Renvoie le lundi 00:00 de la semaine en cours (semaine du lundi au dimanche)
function getStartOfWeek(reference: Date): Date {
  const date = new Date(reference);
  const day = date.getDay(); // 0 = dimanche, 1 = lundi, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Renvoie true si la date fournie tombe dans la semaine calendaire en cours (lundi → dimanche)
export function isThisWeek(value: string | null | undefined): boolean {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const startOfWeek = getStartOfWeek(new Date());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  return date.getTime() >= startOfWeek.getTime() && date.getTime() < endOfWeek.getTime();
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export interface StreakDay {
  label: string;
  active: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export interface StreakInfo {
  current: number;
  longest: number;
  weekDays: StreakDay[];
}

// Calcule la régularité de l'étudiant : un jour est "validé" dès qu'au moins une
// candidature a été ajoutée ce jour-là. Le streak actuel compte les jours consécutifs
// jusqu'à aujourd'hui — avec une "grâce" jusqu'à la fin de la journée : si rien n'a
// encore été ajouté aujourd'hui mais que hier était actif, le streak reste affiché
// intact (il ne se casse qu'au lendemain si toujours rien n'a été fait).
export function computeStreak(activityDates: (string | null | undefined)[]): StreakInfo {
  const activeDays = new Set<string>();
  for (const value of activityDates) {
    if (!value) continue;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) continue;
    activeDays.add(dayKey(date));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let current = 0;
  const cursor = new Date(today);
  if (!activeDays.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (activeDays.has(dayKey(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sortedDays = Array.from(activeDays)
    .map((key) => {
      const [y, m, d] = key.split("-").map(Number);
      return new Date(y, m, d);
    })
    .sort((a, b) => a.getTime() - b.getTime());

  let longest = 0;
  let run = 0;
  let previous: Date | null = null;
  for (const date of sortedDays) {
    if (previous) {
      const diffDays = Math.round((date.getTime() - previous.getTime()) / 86400000);
      run = diffDays === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    previous = date;
  }
  longest = Math.max(longest, current);

  const startOfWeek = getStartOfWeek(today);
  const dayLabels = ["L", "M", "M", "J", "V", "S", "D"];
  const weekDays: StreakDay[] = dayLabels.map((label, i) => {
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + i);
    return {
      label,
      active: activeDays.has(dayKey(date)),
      isToday: dayKey(date) === dayKey(today),
      isFuture: date.getTime() > today.getTime(),
    };
  });

  return { current, longest, weekDays };
}

// Initiales d'une entreprise pour l'avatar rond (ex: "Century 21" -> "C2", "BNP Paribas" -> "BP")
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Nombre de jours de retard (entier positif) entre une date de relance et aujourd'hui.
export function daysOverdue(value: string | null | undefined): number {
  if (!value) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((today.getTime() - target.getTime()) / 86400000));
}
