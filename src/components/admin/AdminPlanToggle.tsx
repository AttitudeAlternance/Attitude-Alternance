"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface AdminPlanToggleProps {
  userId: string;
  currentPlan: "free" | "premium";
}

export function AdminPlanToggle({ userId, currentPlan }: AdminPlanToggleProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    const nextPlan = currentPlan === "premium" ? "free" : "premium";
    setLoading(true);
    try {
      const res = await fetch("/api/admin/set-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, plan: nextPlan }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="secondary" onClick={handleToggle} disabled={loading}>
      {loading ? "..." : currentPlan === "premium" ? "Repasser en gratuit" : "Activer Étudiant+"}
    </Button>
  );
}
