"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AdminPlanToggle } from "@/components/admin/AdminPlanToggle";
import { AdminDeleteUserButton } from "@/components/admin/AdminDeleteUserButton";

interface StudentRow {
  id: string;
  name: string | null;
  email: string | null;
  plan: "free" | "premium";
  applications: number;
  messages: number;
  createdAt: string;
}

interface EmailTemplate {
  label: string;
  subject: string;
  message: string;
}

// Brouillons de départ, à adapter avant envoi — rien n'est envoyé sans clic explicite sur "Confirmer".
const TEMPLATES: EmailTemplate[] = [
  {
    label: "Bonnes pratiques de recherche",
    subject: "3 conseils pour accélérer votre recherche d'alternance",
    message:
      "Bonjour {prenom},\n\nQuelques conseils rapides pour avancer plus vite dans votre recherche :\n\n1. Personnalisez chaque message plutôt que d'envoyer le même à toutes les entreprises — mentionnez un projet ou une actualité de l'entreprise.\n\n2. Relancez systématiquement après 7 jours sans réponse : une relance polie augmente nettement vos chances d'obtenir un retour.\n\n3. Visez au moins 5 candidatures actives en parallèle plutôt qu'une seule à la fois.\n\nBonne recherche,\nL'équipe Attitude Alternance",
  },
  {
    label: "Tuto plateforme",
    subject: "3 fonctionnalités à ne pas manquer sur Attitude Alternance",
    message:
      "Bonjour {prenom},\n\nQuelques fonctionnalités utiles si vous ne les avez pas encore essayées :\n\n- Le générateur de messages IA : un message de candidature personnalisé en quelques secondes, à partir de votre CV et de l'offre.\n\n- Le score de correspondance : collez une offre pour voir en un coup d'œil si votre profil correspond au poste.\n\n- La vérification d'offre : pour repérer les annonces publiées par des écoles plutôt que par de vraies entreprises.\n\nÀ retrouver dans le menu de votre tableau de bord.\n\nL'équipe Attitude Alternance",
  },
];

export function AdminStudentsPanel({ students }: { students: StudentRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  const selectableStudents = useMemo(() => students.filter((s) => !!s.email), [students]);
  const allSelected = selectableStudents.length > 0 && selectableStudents.every((s) => selected.has(s.id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(selectableStudents.map((s) => s.id)));
  }

  function applyTemplate(template: EmailTemplate) {
    setSubject(template.subject);
    setMessage(template.message);
    setResult(null);
  }

  async function handleSend() {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/send-bulk-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userIds: Array.from(selected), subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(
          `Envoyé à ${data.sent} étudiant(s)` +
            (data.failed ? `, ${data.failed} échec(s)` : "") +
            (data.skipped ? `, ${data.skipped} sans email enregistré` : "") +
            "."
        );
        setSelected(new Set());
        setConfirming(false);
        router.refresh();
      } else {
        setResult(data.error || "Une erreur est survenue lors de l'envoi.");
      }
    } catch {
      setResult("Une erreur est survenue lors de l'envoi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Card className="mt-6">
        <h2 className="font-display text-base font-semibold text-ink">Étudiants inscrits</h2>
        <p className="mt-1 text-xs text-muted">
          Réservé à vous seul. Cochez des étudiants pour leur envoyer un email groupé dans le module ci-dessous.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-medium uppercase tracking-wide text-muted">
                <th className="py-2 pr-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Tout sélectionner"
                    className="h-4 w-4 rounded border-line"
                  />
                </th>
                <th className="py-2 pr-4">Nom</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Plan</th>
                <th className="py-2 pr-4">Candidatures</th>
                <th className="py-2 pr-4">Messages</th>
                <th className="py-2 pr-4">Inscrit le</th>
                <th className="py-2 pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="py-2 pr-4">
                    <input
                      type="checkbox"
                      checked={selected.has(s.id)}
                      onChange={() => toggleOne(s.id)}
                      disabled={!s.email}
                      title={!s.email ? "Pas d'email enregistré pour cet étudiant" : undefined}
                      className="h-4 w-4 rounded border-line"
                    />
                  </td>
                  <td className="py-2 pr-4 text-ink/80">{s.name || "—"}</td>
                  <td className="py-2 pr-4 text-ink/80">{s.email || "—"}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={
                        s.plan === "premium"
                          ? "rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success"
                          : "rounded-full bg-paper px-2 py-0.5 text-xs font-medium text-muted"
                      }
                    >
                      {s.plan === "premium" ? "Étudiant+" : "Gratuit"}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-ink/80">{s.applications}</td>
                  <td className="py-2 pr-4 text-ink/80">{s.messages}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-muted">
                    {new Date(s.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-1.5">
                      <AdminPlanToggle userId={s.id} currentPlan={s.plan} />
                      <AdminDeleteUserButton userId={s.id} label={s.name || s.email || "cet étudiant"} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="font-display text-base font-semibold text-ink">Envoyer un email groupé</h2>
        <p className="mt-1 text-xs text-muted">
          {selected.size} étudiant(s) sélectionné(s) ci-dessus recevront cet email. Astuce : utilisez{" "}
          <code className="rounded bg-paper px-1 py-0.5 text-xs">{"{prenom}"}</code> dans le message, il sera
          remplacé automatiquement par le prénom de chaque destinataire.
        </p>

        <div className="mt-3 rounded-lg bg-warn-50 px-3 py-2 text-xs text-ink/80">
          ⚠️ Tant que le nom de domaine n&apos;est pas vérifié sur Resend, les emails ne peuvent être livrés qu&apos;à
          votre propre adresse (limite du mode sandbox) — aucun étudiant ne recevra réellement cet email avant cette
          étape. Le module est prêt et fonctionnera pleinement dès la vérification du domaine.
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <Button key={t.label} size="sm" variant="secondary" type="button" onClick={() => applyTemplate(t)}>
              {t.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => {
              setSubject("");
              setMessage("");
              setResult(null);
            }}
          >
            Vider
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted" htmlFor="bulk-email-subject">
              Sujet
            </label>
            <input
              id="bulk-email-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Objet de l'email"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted" htmlFor="bulk-email-message">
              Message
            </label>
            <textarea
              id="bulk-email-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Votre message... (laissez une ligne vide pour commencer un nouveau paragraphe)"
              rows={8}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
        </div>

        {result && <p className="mt-3 text-sm text-ink/80">{result}</p>}

        <div className="mt-4">
          {confirming ? (
            <div className="flex items-center gap-2">
              <Button variant="primary" onClick={handleSend} disabled={sending}>
                {sending ? "Envoi en cours..." : `Confirmer l'envoi à ${selected.size} étudiant(s)`}
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)} disabled={sending}>
                Annuler
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              disabled={selected.size === 0 || !subject.trim() || !message.trim()}
              onClick={() => setConfirming(true)}
            >
              Envoyer à {selected.size} étudiant(s)
            </Button>
          )}
        </div>
      </Card>
    </>
  );
}
