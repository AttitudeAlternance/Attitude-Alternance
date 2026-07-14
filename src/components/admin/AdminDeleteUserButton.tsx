"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface AdminDeleteUserButtonProps {
  userId: string;
  label: string;
}

export function AdminDeleteUserButton({ userId, label }: AdminDeleteUserButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        setLoading(false);
        setConfirming(false);
      }
    } catch {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="danger" onClick={handleDelete} disabled={loading}>
          {loading ? "..." : `Confirmer`}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={loading}>
          Annuler
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-danger hover:bg-danger-50"
      onClick={() => setConfirming(true)}
      title={`Supprimer le compte de ${label}`}
    >
      Supprimer
    </Button>
  );
}
