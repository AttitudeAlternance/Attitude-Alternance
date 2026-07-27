"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form";

interface SprintHeroProps {
  userId: string;
  initialGoal: number;
  currentCount: number;
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function SprintHero({ userId, initialGoal, currentCount }: SprintHeroProps) {
  const [goal, setGoal] = useState(initialGoal);
  const [editing, setEditing] = useState(false);
  const [draftGoal, setDraftGoal] = useState(initialGoal.toString());
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const percent = goal > 0 ? Math.min(1, currentCount / goal) : 0;
  const reached = currentCount >= goal && goal > 0;
  const remaining = Math.max(0, goal - currentCount);

  async function handleSave() {
    const parsed = parseInt(draftGoal, 10);
    if (Number.isNaN(parsed) || parsed < 1) return;

    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: userId, weekly_goal: parsed });
    setSaving(false);

    if (!error) {
      setGoal(parsed);
      setEditing(false);
      router.refresh();
    }
  }

  const headline = reached
    ? "Objectif de la semaine atteint, bravo !"
    : currentCount === 0
      ? "C'est le moment de démarrer le sprint"
      : `Encore ${remaining} candidature${remaining > 1 ? "s" : ""} pour atteindre l'objectif`;

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-primary px-6 py-6 sm:flex-row sm:items-center sm:gap-7 sm:px-7">
      <div className="relative flex-shrink-0 self-center">
        <svg width="88" height="88" viewBox="0 0 120 120" className="-rotate-90">
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#4E5D93" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke={reached ? "#2F9E60" : "#FF7A47"}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - percent)}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-white">{currentCount}</span>
          <span className="text-[11px] text-primary-100">sur {goal}</span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-display text-base font-semibold text-white sm:text-lg">{headline}</p>

        {editing ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Input
              type="number"
              min={1}
              value={draftGoal}
              onChange={(e) => setDraftGoal(e.target.value)}
              className="w-20"
            />
            <span className="text-xs text-primary-100">candidatures / semaine</span>
            <Button size="sm" variant="accent" onClick={handleSave} disabled={saving}>
              {saving ? "..." : "OK"}
            </Button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Annuler
            </button>
          </div>
        ) : (
          <p className="mt-1 text-sm text-primary-100">
            Objectif : {goal} candidatures cette semaine ·{" "}
            <button
              onClick={() => {
                setDraftGoal(goal.toString());
                setEditing(true);
              }}
              className="underline underline-offset-2 hover:text-white"
            >
              modifier
            </button>
          </p>
        )}
      </div>

      <Link href="/dashboard/applications" className="flex-shrink-0">
        <Button variant="accent" className="w-full sm:w-auto">
          + Ajouter une candidature
        </Button>
      </Link>
    </div>
  );
}
