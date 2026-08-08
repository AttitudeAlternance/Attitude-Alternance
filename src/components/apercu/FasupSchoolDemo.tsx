"use client";

import { useState } from "react";
import Image from "next/image";

// Démo interactive, aux couleurs FASUP', du futur tableau de bord "école".
// Données 100% fictives (aucune connexion à Supabase) — objectif : que FASUP' puisse
// cliquer et se projeter dans l'outil réel, pas de faire croire à de vraies statistiques.
//
// Couleurs extraites du vrai logo FASUP' (public/partenaires/fasup-logo.png) :
// amber de fond du logo, et brun foncé du lion/texte.
const FASUP_AMBER = "#F69E00";
const FASUP_DARK = "#2B2116";

const STATUS_LABELS: Record<string, string> = {
  a_candidater: "À candidater",
  envoyee: "Candidature envoyée",
  relance_a_faire: "Relance à faire",
  entretien_obtenu: "Entretien obtenu",
  refus: "Refus",
  accepte: "Accepté",
};

const STATUS_STYLES: Record<string, string> = {
  a_candidater: "bg-slate-100 text-slate-700 border-slate-200",
  envoyee: "bg-blue-50 text-blue-700 border-blue-200",
  relance_a_faire: "bg-amber-50 text-amber-700 border-amber-200",
  entretien_obtenu: "bg-orange-50 text-orange-700 border-orange-200",
  refus: "bg-red-50 text-red-600 border-red-200",
  accepte: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

interface DemoApplication {
  company: string;
  role: string;
  status: keyof typeof STATUS_LABELS;
  date: string;
}

interface DemoStudent {
  name: string;
  goal: number;
  done: number;
  shared: boolean;
  relances: number;
  apps: DemoApplication[];
}

const STUDENTS: DemoStudent[] = [
  {
    name: "Mona Bouzrara",
    goal: 5,
    done: 6,
    shared: true,
    relances: 1,
    apps: [
      { company: "Decathlon", role: "Chargée de communication", status: "entretien_obtenu", date: "28/07/2026" },
      { company: "Manutan", role: "Assistante marketing digital", status: "relance_a_faire", date: "22/07/2026" },
      { company: "BPCE", role: "Chargée de clientèle", status: "envoyee", date: "18/07/2026" },
    ],
  },
  {
    name: "Florent Crouzet",
    goal: 5,
    done: 7,
    shared: true,
    relances: 0,
    apps: [
      { company: "Cdiscount", role: "Assistant e-commerce", status: "accepte", date: "10/07/2026" },
      { company: "Auchan Retail", role: "Commercial junior", status: "refus", date: "05/07/2026" },
      { company: "Groupe La Poste", role: "Chargé de projet commercial", status: "envoyee", date: "30/06/2026" },
    ],
  },
  { name: "Clara Hermabessière", goal: 3, done: 0, shared: false, relances: 0, apps: [] },
  { name: "Martin Philipot Chevret", goal: 4, done: 1, shared: false, relances: 0, apps: [] },
  {
    name: "Arthur Pitrau",
    goal: 5,
    done: 3,
    shared: true,
    relances: 2,
    apps: [
      { company: "Bordeaux Métropole", role: "Assistant communication", status: "relance_a_faire", date: "26/07/2026" },
      { company: "Château Larrivet", role: "Chargé marketing digital", status: "relance_a_faire", date: "20/07/2026" },
      { company: "Vignobles Ducourt", role: "Commercial export junior", status: "a_candidater", date: "—" },
    ],
  },
  {
    name: "Raphael Fredou",
    goal: 6,
    done: 23,
    shared: true,
    relances: 0,
    apps: [{ company: "Orange", role: "Alternant relation client", status: "accepte", date: "02/06/2026" }],
  },
];

const TEMPLATES = [
  {
    label: "🎯 Rappel objectif de la semaine",
    subject: "Où en êtes-vous cette semaine ?",
    message:
      "Bonjour {prenom},\n\nOn a remarqué que vous n'avez pas encore atteint votre objectif de candidatures cette semaine. Besoin d'un coup de main pour trouver des offres ou relancer une candidature ?\n\nBon courage,\nL'équipe FASUP'",
  },
  {
    label: "📅 Point d'étape mi-parcours",
    subject: "Point d'étape sur votre recherche d'alternance",
    message:
      "Bonjour {prenom},\n\nOn fait un point à mi-parcours : où en êtes-vous ? Des entretiens en cours, des difficultés à trouver des offres ?\n\nRépondez-nous directement si besoin d'accompagnement.\n\nL'équipe FASUP'",
  },
  {
    label: "💬 Proposer un rendez-vous",
    subject: "Un rendez-vous conseil carrière ?",
    message:
      "Bonjour {prenom},\n\nNous proposons des rendez-vous individuels de 20 minutes pour faire le point sur votre recherche d'alternance.\n\nRépondez avec vos disponibilités si ça vous intéresse.\n\nL'équipe FASUP'",
  },
];

export function FasupSchoolDemo() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendResult, setSendResult] = useState("");

  const allSelected = selected.size === STUDENTS.length;

  function toggleOne(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(STUDENTS.map((_, i) => i)));
  }

  function applyTemplate(i: number) {
    setSubject(TEMPLATES[i].subject);
    setMessage(TEMPLATES[i].message);
    setSendResult("");
  }

  const openStudent = openIndex !== null ? STUDENTS[openIndex] : null;
  const canSend = selected.size > 0 && subject.trim() !== "" && message.trim() !== "";

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      {/* Bandeau de démo */}
      <div className="border-b border-line bg-white px-4 py-2 text-center text-[11px] text-muted">
        Démo interactive — données fictives, aperçu de l&apos;espace FASUP&apos; Bordeaux
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* En-tête */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/partenaires/fasup-logo.png"
              alt="Logo FASUP'"
              width={44}
              height={44}
              className="h-11 w-11 rounded-xl object-cover shadow-sm"
            />
            <div>
              <h1 className="text-lg font-bold text-ink">FASUP&apos; Bordeaux — Suivi des étudiants</h1>
              <p className="text-xs text-muted">Espace école · lecture seule</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["56", "Étudiants inscrits"],
            ["340", "Candidatures envoyées"],
            ["64%", "Objectif hebdo atteint en moyenne"],
            ["38", "Ayant partagé le détail"],
          ].map(([n, label]) => (
            <div key={label} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
              <div className="text-2xl font-extrabold" style={{ color: FASUP_DARK }}>
                {n}
              </div>
              <div className="mt-1 text-[11px] text-muted">{label}</div>
            </div>
          ))}
        </div>

        {/* Tableau étudiants */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">Étudiants</h2>
          <p className="mt-1 text-xs text-muted">
            Le détail des candidatures n&apos;est visible que pour les étudiants ayant activé le partage.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[10.5px] font-semibold uppercase tracking-wide text-muted">
                  <th className="w-8 py-2 pr-2">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded border-line" />
                  </th>
                  <th className="py-2 pr-4">Nom</th>
                  <th className="py-2 pr-4">Objectif hebdo</th>
                  <th className="py-2 pr-4">Candidatures</th>
                  <th className="py-2 pr-4">Progression</th>
                  <th className="py-2 pr-4">Relances</th>
                  <th className="py-2 pr-4">Partage</th>
                  <th className="py-2 pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {STUDENTS.map((s, i) => {
                  const pct = Math.min(100, Math.round((s.done / s.goal) * 100));
                  return (
                    <tr
                      key={s.name}
                      className={s.shared ? "cursor-pointer hover:bg-[#F6F7FB]" : "opacity-70"}
                      onClick={() => s.shared && setOpenIndex(i)}
                    >
                      <td className="py-2.5 pr-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(i)}
                          onChange={() => toggleOne(i)}
                          className="h-4 w-4 rounded border-line"
                        />
                      </td>
                      <td className="py-2.5 pr-4 font-medium text-ink">{s.name}</td>
                      <td className="py-2.5 pr-4 text-ink/80">{s.goal} / semaine</td>
                      <td className="py-2.5 pr-4 text-ink/80">{s.done}</td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-line">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? "#2F9E60" : FASUP_AMBER }}
                            />
                          </div>
                          <span className="text-[11px] text-muted">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4">
                        {s.shared ? (
                          s.relances > 0 ? (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                              ⚠️ {s.relances}
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                              À jour
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] text-muted">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4">
                        {s.shared ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            ✓ Partagé
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                            🔒 Non partagé
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={!s.shared}
                          onClick={() => s.shared && setOpenIndex(i)}
                          className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
                          style={s.shared ? { color: FASUP_DARK } : undefined}
                        >
                          Voir le détail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Module mailing */}
        <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">Envoyer un email groupé</h2>
          <p className="mt-1 text-xs text-muted">{selected.size} étudiant(s) sélectionné(s) recevront cet email.</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {TEMPLATES.map((t, i) => (
              <button
                key={t.label}
                type="button"
                onClick={() => applyTemplate(i)}
                className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium"
                style={{ color: FASUP_DARK }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-muted">Sujet</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Objet de l'email"
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Votre message..."
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              disabled={!canSend}
              onClick={() => setSendResult(`Envoyé à ${selected.size} étudiant(s) — (démo, aucun email réel envoyé).`)}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: FASUP_DARK }}
            >
              Envoyer à {selected.size} étudiant(s)
            </button>
            {sendResult && <span className="text-xs font-medium text-emerald-600">{sendResult}</span>}
          </div>
        </div>
      </div>

      {/* Panneau détail */}
      {openStudent && (
        <>
          <div className="fixed inset-0 z-30 bg-ink/30" onClick={() => setOpenIndex(null)} />
          <div className="fixed bottom-0 right-0 top-0 z-40 w-full max-w-md overflow-y-auto bg-[#F6F7FB] shadow-2xl">
            <div className="sticky top-0 border-b border-line bg-white p-5">
              <button
                type="button"
                onClick={() => setOpenIndex(null)}
                className="absolute right-4 top-4 text-lg text-muted"
                aria-label="Fermer"
              >
                ✕
              </button>
              <h3 className="text-base font-bold text-ink">{openStudent.name}</h3>
              <p className="mt-1 text-xs text-muted">
                {openStudent.apps.length} candidature(s) — objectif {openStudent.goal}/semaine, {openStudent.done} réalisées
              </p>
            </div>
            <div className="p-5">
              {openStudent.apps.length === 0 ? (
                <p className="text-sm text-muted">Aucune candidature enregistrée pour l&apos;instant.</p>
              ) : (
                <div className="space-y-3">
                  {openStudent.apps.map((a, i) => (
                    <div key={i} className="rounded-xl border border-line bg-white p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-bold text-ink">{a.company}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${STATUS_STYLES[a.status]}`}>
                          {STATUS_LABELS[a.status]}
                        </span>
                      </div>
                      <div className="mb-2 text-xs text-muted">{a.role}</div>
                      <div className="text-[11px] text-muted">Candidature : {a.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
