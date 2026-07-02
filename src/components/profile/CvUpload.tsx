"use client";

import { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

interface CvUploadProps {
  initialSummary: string | null;
  initialUploadedAt: string | null;
}

// Convertit un fichier en base64 (sans le préfixe "data:application/pdf;base64,")
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.readAsDataURL(file);
  });
}

export function CvUpload({ initialSummary, initialUploadedAt }: CvUploadProps) {
  const [summary, setSummary] = useState<string | null>(initialSummary);
  const [uploadedAt, setUploadedAt] = useState<string | null>(initialUploadedAt);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedRealAi, setUsedRealAi] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Seuls les fichiers PDF sont acceptés pour le moment.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Ce fichier dépasse la taille maximale autorisée (4 Mo).");
      return;
    }

    setError(null);
    setLoading(true);
    setFileName(file.name);

    try {
      const fileBase64 = await fileToBase64(file);
      const res = await fetch("/api/parse-cv", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fileBase64, fileName: file.name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue lors de l'analyse du CV.");
        return;
      }

      setSummary(data.summary);
      setUsedRealAi(data.usedRealAi);
      setUploadedAt(new Date().toISOString());
    } catch {
      setError("Une erreur est survenue lors de l'envoi du fichier.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mon CV</CardTitle>
        <CardDescription>
          Déposez votre CV au format PDF : il sera lu et résumé pour personnaliser automatiquement vos messages générés par IA.
        </CardDescription>
      </CardHeader>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
        id="cv-upload-input"
      />

      <label
        htmlFor="cv-upload-input"
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-paper/60 px-4 py-8 text-center transition-colors hover:border-primary-200 hover:bg-primary-50"
      >
        <span className="text-sm font-medium text-ink">
          {loading ? "Analyse en cours..." : summary ? "Déposer un nouveau CV (remplace l'actuel)" : "Cliquez pour déposer votre CV (PDF, 4 Mo max)"}
        </span>
        {fileName && !loading && <span className="mt-1 text-xs text-muted">{fileName}</span>}
      </label>

      {error && <p className="mt-3 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger">{error}</p>}

      {summary && !loading && (
        <div className="mt-4 rounded-xl border border-line bg-paper/60 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-primary">Profil détecté à partir du CV</span>
            {uploadedAt && <span className="text-xs text-muted">Déposé le {formatDate(uploadedAt)}</span>}
          </div>
          <p className="whitespace-pre-wrap text-sm text-ink/90">{summary}</p>
          {!usedRealAi && (
            <p className="mt-2 text-xs text-warn">
              Résumé simplifié (aucune clé IA configurée) — connectez ANTHROPIC_API_KEY pour une analyse plus fine du profil.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
