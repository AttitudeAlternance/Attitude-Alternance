// Correspondance entre les secteurs proposés à l'étudiant (langage simple) et les codes ROME
// officiels attendus par l'API "La bonne alternance". Les codes Commerce & Vente et Marketing
// ont été réélargis le 16/08/2026 : la liste initiale (3 codes pour "Commerce & Vente", 1 seul
// pour "Marketing") était bien trop étroite et faisait manquer de vraies offres pourtant
// visibles sur le site officiel La bonne alternance (ex : "Chef de Secteur GMS", relevant en
// réalité de D1502/D1509 — management de rayon/département en grande distribution — absents de
// l'ancienne liste). Vérifiés individuellement via les fiches ROME officielles. Les autres
// secteurs (Communication, RH, Digital, Comptabilité, Administratif, Immobilier) n'ont pas
// encore été réaudités de la même façon et méritent probablement le même élargissement.
export interface SectorOption {
  key: string;
  label: string;
  romes: string[];
}

export const SECTOR_OPTIONS: SectorOption[] = [
  {
    key: "commerce",
    label: "Commerce & Vente",
    romes: [
      "D1401", // Assistanat commercial
      "D1402", // Relation commerciale grands comptes et entreprises
      "D1403", // Relation commerciale auprès de particuliers
      "D1404", // Relation commerciale en vente de véhicules
      "D1406", // Management en force de vente
      "D1407", // Relation technico-commerciale
      "D1408", // Téléconseil et télévente
      "D1501", // Animation de vente
      "D1502", // Management/gestion de rayon produits alimentaires
      "D1506", // Marchandisage
      "D1507", // Mise en rayon libre-service
      "D1509", // Management de département en grande distribution
      "D1301", // Management de magasin de détail
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    romes: [
      "M1705", // Marketing
      "M1703", // Management et gestion de produit
      "M1706", // Promotion des ventes
      "M1707", // Stratégie commerciale
    ],
  },
  { key: "communication", label: "Communication", romes: ["E1103"] },
  { key: "rh", label: "Ressources Humaines", romes: ["M1501", "M1502"] },
  { key: "digital", label: "Informatique & Digital", romes: ["M1805", "M1806"] },
  { key: "compta", label: "Comptabilité & Gestion", romes: ["M1203", "M1204"] },
  { key: "admin", label: "Administratif & Secrétariat", romes: ["M1601", "M1607"] },
  { key: "immobilier", label: "Immobilier", romes: ["C1503", "C1504"] },
];

// Traduit une liste de clés de secteurs (ex: ["commerce", "marketing"]) en une liste de codes
// ROME uniques, prête à être envoyée à l'API.
export function sectorsToRomeCodes(sectorKeys: string[]): string[] {
  const codes = new Set<string>();
  for (const key of sectorKeys) {
    const sector = SECTOR_OPTIONS.find((s) => s.key === key);
    sector?.romes.forEach((code) => codes.add(code));
  }
  return Array.from(codes);
}

export const SEARCH_RADIUS_OPTIONS = [10, 30, 60, 100];
