// Correspondance entre les secteurs proposés à l'étudiant (langage simple) et les codes ROME
// officiels attendus par l'API "La bonne alternance". Les codes Commerce / Marketing /
// Communication ont été vérifiés individuellement (fiches ROME officielles) ; les autres
// reposent sur les intitulés ROME les plus courants pour le secteur et méritent d'être
// affinés si les résultats obtenus semblent trop larges ou trop étroits une fois testés.
export interface SectorOption {
  key: string;
  label: string;
  romes: string[];
}

export const SECTOR_OPTIONS: SectorOption[] = [
  { key: "commerce", label: "Commerce & Vente", romes: ["D1402", "D1403", "D1407"] },
  { key: "marketing", label: "Marketing", romes: ["M1705"] },
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
