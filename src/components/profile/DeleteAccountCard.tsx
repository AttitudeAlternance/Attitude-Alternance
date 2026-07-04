"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function DeleteAccountCard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/delete-account", { method: "POST" });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Une erreur est survenue.");
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-danger">Zone de danger</CardTitle>
        <CardDescription>
          Supprimer votre compte efface définitivement votre profil, votre CV, vos candidatures et vos messages
          générés. Cette action est irréversible.
        </CardDescription>
      </CardHeader>
      <Button variant="danger" onClick={() => setModalOpen(true)}>
        Supprimer mon compte
      </Button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirmer la suppression du compte"
        description="Cette action est définitive et ne peut pas être annulée."
        widthClass="max-w-md"
      >
        <p className="text-sm text-muted">
          Pour confirmer, tapez <strong>SUPPRIMER</strong> dans le champ ci-dessous.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="mt-3 w-full rounded-xl border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-danger/30"
          placeholder="SUPPRIMER"
        />
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        <div className="mt-5 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={confirmText !== "SUPPRIMER" || loading}>
            {loading ? "Suppression..." : "Supprimer définitivement"}
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
