import { ImportExpressGuide } from "@/components/import-express/ImportExpressGuide";

export default function ImportExpressPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Import express</h1>
        <p className="mt-1 text-sm text-muted">
          Un raccourci &agrave; installer une fois pour ajouter une candidature en 20 secondes, sans tout retaper &agrave; la main.
        </p>
      </div>

      <ImportExpressGuide />
    </div>
  );
}
