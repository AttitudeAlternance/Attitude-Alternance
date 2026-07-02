"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form";
import { cn } from "@/lib/utils";

interface WeeklyGoalCardProps {
  userId: string;
  initialGoal: number;
  currentCount: number;
}

export function WeeklyGoalCard({ userId, initialGoal, currentCount }: WeeklyGoalCardProps) {
  const [goal, setGoal] = useState(initialGoal);
  const [editing, setEditing] = useState(false);
  const [draftGoal, setDraftGoal] = useState(initialGoal.toString());
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const percent = goal > 0 ? Math.min(100, Math.round((currentCount / goal) * 100)) : 0;
  const reached = currentCount >= goal && goal > 0;

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

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-ink">Objectif de la semaine</h2>
        {!editing && (
          <button
            onClick={() => {
              setDraftGoal(goal.toString());
              setEditing(true);
            }}
            className="text-xs font-medium text-primary hover:underline"
          >
            Modifier
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            value={draftGoal}
            onChange={(e) => setDraftGoal(e.target.value)}
            className="w-24"
          />
          <span className="text-sm text-muted">candidatures / semaine</span>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "..." : "OK"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Annuler
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{currentCount}</span> / {goal} candidatures cette semaine
          </p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className={cn("h-full rounded-full transition-all", reached ? "bg-success" : "bg-primary")}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className={cn("mt-2 text-xs font-medium", reached ? "text-success" : "text-muted")}>
            {reached ? "Objectif atteint, bravo ! 🎉" : `${percent}% de l'objectif atteint`}
          </p>
        </>
      )}
    </Card>
  );
}
