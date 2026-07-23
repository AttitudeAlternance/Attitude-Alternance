"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApplicationForm } from "@/components/applications/ApplicationForm";
import { ApplicationsTable } from "@/components/applications/ApplicationsTable";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type Application,
  type ApplicationInput,
  type ApplicationStatus,
} from "@/lib/types";

interface ApplicationsBoardProps {
  initialApplications: Application[];
  userId: string;
  plan: "free" | "premium";
  freeLimit: number;
  initialTotalCreated: number;
  bonusApplications: number;
}

type SortOrder = "recent" | "ancien" | "relance";

export function ApplicationsBoard({
  initialApplications,
  userId,
  plan,
  freeLimit,
  initialTotalCreated,
  bonusApplications,
}: ApplicationsBoardProps) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [totalCreated, setTotalCreated] = useState(initialTotalCreated);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [deletingApp, setDeletingApp] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  // La limite gratuite s'étend avec les bonus de parrainage.
  const effectiveLimit = freeLimit + bonusApplications;
  const atLimit = plan === "free" && totalCreated >= effectiveLimit;

  const filtered = useMemo(() => {
    let list = [...applications];
    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((a) => a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (sortOrder === "relance") {
        const dateA = a.next_followup_at ? new Date(a.next_followup_at).getTime() : Infinity;
        const dateB = b.next_followup_at ? new Date(b.next_followup_at).getTime() : Infinity;
        return dateA - dateB;
      }
      const dateA = new Date(a.applied_at ?? a.created_at).getTime();
      const dateB = new Date(b.applied_at ?? b.created_at).getTime();
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });
    return list;
  }, [applications, statusFilter, sortOrder, search]);

  function openCreateModal() {
    if (atLimit) {
      setLimitModalOpen(true);
      return;
    }
    setEditingApp(null);
    setError(null);
    setModalOpen(true);
  }

  function openEditModal(app: Application) {
    setEditingApp(app);
    setError(null);
    setModalOpen(true);
  }

  async function handleSubmit(values: ApplicationInput) {
    setError(null);
    if (editingApp) {
      const { data, error } = await supabase
        .from("applications")
        .update(values)
        .eq("id", editingApp.id)
        .select()
        .single();
      if (error) {
        setError("Impossible d'enregistrer les modifications.");
        return;
      }
      setApplications((prev) => prev.map((a) => (a.id === editingApp.id ? (data as Application) : a)));
    } else {
      const { data, error } = await supabase
        .from("applications")
        .insert({ ...values, user_id: userId })
        .select()
        .single();
      if (error) {
        setError("Impossible d'ajouter cette candidature.");
        return;
      }
      setApplications((prev) => [data as Application, ...prev]);
      setTotalCreated((prev) => prev + 1);
    }
    setModalOpen(false);
  }

  async function handleDelete() {
    if (!deletingApp) return;
    const { error } = await supabase.from("applications").delete().eq("id", deletingApp.id);
    if (!error) {
      setApplications((prev) => prev.filter((a) => a.id !== deletingApp.id));
    }
    setDeletingApp(null);
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-56">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une entreprise, un poste..."
            />
          </div>

          <div className="w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "all")}
            >
              <option value="all">Tous les statuts</option>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-52">
            <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)}>
              <option value="recent">Plus récentes</option>
              <option value="ancien">Plus anciennes</option>
              <option value="relance">Relance la plus proche</option>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {plan === "free" && (
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-100"
            >
              ✨ Étudiant+ : candidatures illimitées
            </Link>
          )}
          <Button onClick={openCreateModal}>+ Ajouter une candidature</Button>
        </div>
      </div>

      {plan === "free" && totalCreated >= Math.round(effectiveLimit * 0.8) && (
        <p className="mb-4 rounded-lg bg-warn-50 px-3 py-2 text-xs font-medium text-warn">
          {totalCreated}/{effectiveLimit} candidatures utilisées sur l&apos;offre gratuite
          {bonusApplications > 0 ? ` (dont ${bonusApplications} bonus parrainage)` : ""}.{" "}
          <Link href="/dashboard/profile" className="underline">
            Passer à Étudiant+
          </Link>{" "}
          pour un suivi illimité.
        </p>
      )}

      {applications.length === 0 ? (
        <EmptyState
          title="Aucune candidature pour le moment"
          description="Ajoutez votre première candidature pour commencer à suivre votre recherche d'alternance."
          action={<Button onClick={openCreateModal}>+ Ajouter une candidature</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucun résultat"
          description="Essayez un autre mot-clé ou un autre statut, ou réinitialisez les filtres."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setStatusFilter("all");
                setSearch("");
              }}
            >
              Réinitialiser les filtres
            </Button>
          }
        />
      ) : (
        <ApplicationsTable applications={filtered} onEdit={openEditModal} onDelete={setDeletingApp} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingApp ? "Modifier la candidature" : "Ajouter une candidature"}
        description="Renseignez les informations liées à cette candidature."
        widthClass="max-w-2xl"
      >
        {error && <p className="mb-3 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger">{error}</p>}
        <ApplicationForm initialValue={editingApp} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>

      <Modal
        open={Boolean(deletingApp)}
        onClose={() => setDeletingApp(null)}
        title="Supprimer cette candidature ?"
        description={deletingApp ? `${deletingApp.company} — ${deletingApp.role}` : ""}
        widthClass="max-w-md"
      >
        <p className="text-sm text-muted">Cette action est définitive et ne peut pas être annulée.</p>
        <div className="mt-5 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={() => setDeletingApp(null)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Supprimer
          </Button>
        </div>
      </Modal>

      <Modal
        open={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        title="Limite de l'offre gratuite atteinte"
        description={`L'offre gratuite est limitée à ${effectiveLimit} candidatures suivies.`}
        widthClass="max-w-md"
      >
        <p className="text-sm text-muted">
          Passez à Étudiant+ pour suivre un nombre illimité de candidatures et débloquer un usage étendu du générateur IA. Vous pouvez aussi parrainer un ami pour débloquer 5 candidatures supplémentaires gratuitement.
        </p>
        <div className="mt-5 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={() => setLimitModalOpen(false)}>
            Plus tard
          </Button>
          <Link href="/dashboard/profile">
            <Button>Passer à Étudiant+</Button>
          </Link>
        </div>
      </Modal>
    </div>
  );
}
