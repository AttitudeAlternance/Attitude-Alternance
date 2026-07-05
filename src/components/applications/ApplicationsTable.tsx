"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, isDueToday, isOverdue, cn } from "@/lib/utils";
import type { Application } from "@/lib/types";

interface ApplicationsTableProps {
  applications: Application[];
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
}

export function ApplicationsTable({ applications, onEdit, onDelete }: ApplicationsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-paper/60 text-xs font-medium uppercase tracking-wide text-muted">
            <th className="px-4 py-3">Entreprise</th>
            <th className="px-4 py-3">Poste</th>
            <th className="px-4 py-3">Candidature</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Relance prévue</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {applications.map((app) => {
            const overdue = isOverdue(app.next_followup_at);
            const dueToday = isDueToday(app.next_followup_at);
            return (
              <tr
                key={app.id}
                className={cn(
                  "align-top",
                  overdue && "bg-danger-50/60",
                  dueToday && !overdue && "bg-warn-50/60"
                )}
              >
                <td className="px-4 py-3 font-medium text-ink">
                  {app.company}
                  {app.offer_url && (
                    <a
                      href={app.offer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1.5 text-xs font-normal text-primary hover:underline"
                    >
                      voir l&apos;offre
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-ink/80">{app.role}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{formatDate(app.applied_at)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-4 py-3 text-xs text-ink/80">
                  {app.linkedin_contact && <p>{app.linkedin_contact}</p>}
                  {app.contact_email && <p className="text-muted">{app.contact_email}</p>}
                  {!app.linkedin_contact && !app.contact_email && <span className="text-muted">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "font-mono text-xs",
                      overdue ? "font-semibold text-danger" : dueToday ? "font-semibold text-warn" : "text-muted"
                    )}
                  >
                    {formatDate(app.next_followup_at)}
                    {overdue && " · en retard"}
                    {dueToday && !overdue && " · aujourd'hui"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    <Link href={`/dashboard/messages?applicationId=${app.id}`}>
                      <Button size="sm" variant="secondary">
                        ✦ Générer un message
                      </Button>
                    </Link>
                    <Link href={`/dashboard/match-score?applicationId=${app.id}`}>
                      <Button size="sm" variant="secondary">
                        🎯 Score
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={() => onEdit(app)}>
                      Modifier
                    </Button>
                    <Button size="sm" variant="ghost" className="text-danger hover:bg-danger-50" onClick={() => onDelete(app)}>
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
