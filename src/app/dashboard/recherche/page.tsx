"use client";

import { useState } from "react";

const SECTEURS = [
  { label: "Commerce / Vente", romes: ["D1214", "D1406", "D1501"] },
  { label: "Marketing / Communication", romes: ["E1103", "M1705", "M1703"] },
  { label: "Ressources Humaines", romes: ["M1502"] },
  { label: "Informatique / Digital", romes: ["M1805", "M1802"] },
  { label: "Comptabilite / Finance", romes: ["M1203", "M1204"] },
];

export default function RecherchePage() {
  const [codePostal, setCodePostal] = useState("");
  const [secteurChoisi, setSecteurChoisi] = useState(SECTEURS[0].label);
  const [rayon, setRayon] = useState(30);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [offres, setOffres] = useState(null);
  const [entreprisesPotentielles, setEntreprisesPotentielles] = useState(null);
  const [commune, setCommune] = useState(null);

  async function handleRecherche(e) {
    e.preventDefault();
    setLoading(true);
    setErreur(null);
    setOffres(null);
    setEntreprisesPotentielles(null);

    const secteur = SECTEURS.find(function (s) {
      return s.label === secteurChoisi;
    });

    try {
      const res = await fetch("/api/recherche-offres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codePostal: codePostal,
          romes: secteur ? secteur.romes : [],
          radius: rayon,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.error || "Une erreur est survenue.");
        return;
      }

      setOffres(data.offres);
      setEntreprisesPotentielles(data.entreprisesPotentielles);
      setCommune(data.commune);
    } catch (err) {
      setErreur("Impossible de contacter le service de recherche.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#2B3A67] mb-2">
        Rechercher une offre d'alternance
      </h1>
      <p className="text-gray-600 mb-6">
        Trouvez des offres et des entreprises qui recrutent en alternance, directement depuis votre espace.
      </p>

      <form onSubmit={handleRecherche} className="bg-white border border-gray-200 rounded-lg p-5 mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Code postal</label>
          <input
            type="text"
            value={codePostal}
            onChange={function (e) { setCodePostal(e.target.value); }}
            placeholder="Ex : 33000"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Secteur</label>
          <select
            value={secteurChoisi}
            onChange={function (e) { setSecteurChoisi(e.target.value); }}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            {SECTEURS.map(function (s) {
              return (
                <option key={s.label} value={s.label}>
                  {s.label}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Rayon de recherche : {rayon} km
          </label>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={rayon}
            onChange={function (e) { setRayon(Number(e.target.value)); }}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#FF7A47] text-white font-medium px-5 py-2 rounded-md disabled:opacity-50"
        >
          {loading ? "Recherche en cours..." : "Rechercher"}
        </button>
      </form>

      {erreur && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-6">
          {erreur}
        </div>
      )}

      {offres && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">
            {offres.length} offre(s) trouvee(s) autour de {commune}
          </h2>

          {offres.length === 0 && (
            <p className="text-gray-500">
              Aucune offre trouvee pour ce secteur dans cette zone. Essayez d'elargir le rayon de recherche.
            </p>
          )}

          <div className="space-y-3">
            {offres.map(function (offre) {
              return (
                <div key={offre.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold">{offre.titre}</h3>
                  <p className="text-sm text-gray-600">{offre.entreprise}</p>
                  {offre.adresse && (
                    <p className="text-sm text-gray-500">{offre.adresse}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {offre.typeContrat}
                    {offre.dureeContratMois ? " - " + offre.dureeContratMois + " mois" : ""}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {offre.urlCandidature && (
                      
                        href={offre.urlCandidature}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#2B3A67] underline"
                      >
                        Voir l'offre
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {entreprisesPotentielles && entreprisesPotentielles.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Entreprises a fort potentiel pour une candidature spontanee
          </h2>
          <div className="space-y-2">
            {entreprisesPotentielles.map(function (ent, i) {
              return (
                <div key={i} className="border border-gray-200 rounded-lg p-3 text-sm">
                  <p className="font-medium">{ent.nom}</p>
                  {ent.adresse && (
                    <p className="text-gray-500">{ent.adresse}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
