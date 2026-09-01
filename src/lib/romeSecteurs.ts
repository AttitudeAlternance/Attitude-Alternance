// Correspondance entre les secteurs proposés à l'étudiant (langage simple) et les codes ROME
// officiels attendus par l'API "La bonne alternance". Élargie au maximum le 16/08/2026 pour
// TOUS les secteurs : la liste initiale ne comptait que 1 à 3 codes par secteur et faisait
// manquer de vraies offres pourtant visibles sur le site officiel La bonne alternance (ex :
// "Chef de Secteur GMS", relevant en réalité de D1502/D1509 — management de rayon/département
// en grande distribution — absent de l'ancienne liste "Commerce & Vente"). Chaque code a été
// vérifié individuellement via les fiches ROME officielles (France Travail / Mission
// Apprentissage) plutôt que deviné — voir sources dans la conversation du 16/08/2026. Volontai-
// rement exclus : les codes trop spécialisés/manuels hors du profil visé par nos étudiants
// (ex : M1609 secrétariat médical, D1101-D1107 métiers de bouche, E12xx/E13xx photo-labo et
// impression industrielle).
//
// MISE À JOUR DU 01/09/2026 — changement de méthode : l'outil de diagnostic
// (/api/debug-offres-diagnostic?comparer=1) a été modifié pour afficher, pour chaque offre
// manquante, le ou les codes ROME RÉELLEMENT envoyés par l'API elle-même (champ "codes_rome"),
// au lieu de deviner le bon code à partir du seul intitulé du poste. Résultat sur le test du
// 01/09/2026 (Bordeaux, 15 km) : aucune des 103 offres manquantes ne portait un code déjà présent
// dans nos secteurs — donc pas de bug caché côté dédoublonnage/logique de recherche, seulement de
// vrais codes ROME encore absents de la liste. Ça a aussi révélé que plusieurs offres bien
// réelles et clairement dans nos secteurs (contrôle de gestion, communication digitale, référencement SEO,
// administration réseau, data analyste...) portent des codes ROME qui n'existent dans AUCUN des
// référentiels ROME publics consultés (blocsdecompetences.org, rome.adem.etat.lu, listes PDF
// régionales) — signe probable que La bonne alternance utilise une version plus récente et plus
// détaillée de la nomenclature ROME (ROME 4.0) que ces sites tiers n'ont pas encore répertoriée.
// Pour ces codes-là, la preuve retenue est donc double : le code exact tel qu'envoyé par l'API
// sur CETTE offre précise, recoupé avec l'intitulé réel du poste (ex. "Alternance -
// Administrateur Réseau & Sécurité" → M1830) — repéré comme tel dans chaque commentaire ci-
// dessous plutôt que présenté comme vérifié via une fiche ROME officielle.
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
      "D1301", // Management de magasin de détail
      "D1401", // Assistanat commercial
      "D1402", // Relation commerciale grands comptes et entreprises
      "D1403", // Relation commerciale auprès de particuliers
      "D1404", // Relation commerciale en vente de véhicules
      "D1406", // Management en force de vente
      "D1407", // Relation technico-commerciale
      "D1408", // Téléconseil et télévente
      "D1501", // Animation de vente
      "D1502", // Management/gestion de rayon produits alimentaires
      "D1504", // Direction de magasin de grande distribution
      "D1506", // Marchandisage
      "D1507", // Mise en rayon libre-service
      "D1509", // Management de département en grande distribution
      "D1106", // Vente en alimentation
      // Ajoutés le 20/08/2026 : famille "vente spécialisée par famille de produits", absente de
      // la liste précédente. Manque confirmé en production via l'outil de diagnostic — des
      // offres bien réelles ("Vendeur / Vendeuse en prêt-à-porter", "Vendeur de chaussures",
      // "VENDEUR EN ALTERNANCE TABAC PRESSE") n'apparaissaient pas car aucun de ces 4 codes
      // n'était envoyé à l'API.
      "D1211", // Vente en articles de sport et loisirs
      "D1212", // Vente en décoration et équipement du foyer
      "D1213", // Vente en gros de matériel et équipement
      "D1214", // Vente en habillement et accessoires de la personne
      // Ajoutés le 20/08/2026, suite à la comparaison automatisée "nos 8 secteurs vs. aucun
      // filtre" (outil /api/debug-offres-diagnostic?comparer=1) sur 174 offres manquantes :
      "D1503", // Management/gestion de rayon produits NON alimentaires — on avait D1502
      // (rayon alimentaire) mais pas son équivalent non-alimentaire, pourtant très demandé
      // (ex. "Responsable de rayon" hors alimentaire).
      "D1505", // Personnel de caisse — explique plusieurs offres manquantes récurrentes
      // ("Employé commercial caisse & services", "Employé(e) commercial(e) (BTS EN
      // ALTERNANCE)") : le mot-clé "caisse" n'était couvert par aucun code envoyé jusqu'ici.
      "D1508", // Encadrement du personnel de caisses — le pendant "management" de D1505,
      // ajouté par cohérence (comme D1502/D1509 existent déjà côté management).
      "D1107", // Vente en gros de produits frais — explique "Commercial / Commerciale en
      // alimentaire en gros" (AYL DISTRIBUTION). Ce code fait partie de la famille D110x
      // "métiers de bouche" volontairement exclue à l'origine (boulangerie, boucherie...),
      // mais D1107 correspond en réalité à un poste commercial/vente en gros, pas à un
      // métier manuel de production alimentaire — il a donc sa place ici.
      // Ajoutés le 01/09/2026, via le code ROME réel renvoyé par l'API (voir note en tête de
      // fichier) :
      "D1221", // Vente de produits culturels et ludiques — confirmé via une fiche ROME
      // officielle (trouver-formation.fr) : couvre entre autres la vente en magasin de jouets
      // ("Conseillère de vente en magasin de jouets" — AUREIS FORMATION).
      "D1438", // Code renvoyé par l'API pour "Chargé(e) de mission cross-merchandising" chez
      // E.Leclerc (Brico) — absent des référentiels ROME publics consultés (probable code
      // ROME 4.0 récent), mais l'intitulé du poste confirme un rôle de merchandising/commerce.
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    romes: [
      "M1701", // Administration des ventes
      "M1702", // Analyse de tendance
      "M1703", // Management et gestion de produit
      "M1705", // Marketing
      "M1706", // Promotion des ventes
      "M1707", // Stratégie commerciale
    ],
  },
  {
    key: "communication",
    label: "Communication",
    romes: [
      "E1101", // Animation de site multimédia
      "E1102", // Écriture d'ouvrages, de livres
      "E1103", // Communication
      "E1104", // Conception de contenus multimédias
      "E1105", // Coordination d'édition
      "E1106", // Journalisme et information média
      "E1107", // Organisation d'événementiel
      "E1108", // Traduction, interprétariat
      "E1401", // Développement et promotion publicitaire
      "E1402", // Élaboration de plan média
      // Ajoutés le 01/09/2026, via le code ROME réel renvoyé par l'API (voir note en tête de
      // fichier) — absents des référentiels ROME publics consultés (probables codes ROME 4.0
      // récents), confirmés par l'intitulé du poste correspondant :
      "E1112", // Code renvoyé pour "Chargé(e) de communication digitale" (HECODIS).
      "E1405", // Code renvoyé pour "Chargé(e) de référencement SEO-GEO" (HUMAN IMMOBILIER).
    ],
  },
  {
    key: "rh",
    label: "Ressources Humaines",
    romes: [
      "M1501", // Assistanat en ressources humaines
      "M1502", // Développement des ressources humaines
      "M1503", // Management des ressources humaines
      // Ajouté le 01/09/2026 : code renvoyé par l'API pour "Assistant(e) paie" (EBBS-BUSINESS
      // SCHOOL) — absent des référentiels ROME publics consultés (probable code ROME 4.0
      // récent), confirmé par l'intitulé du poste (gestion de la paie).
      "M1507",
    ],
  },
  {
    key: "digital",
    label: "Informatique & Digital",
    romes: [
      "M1801", // Administration de systèmes d'information
      "M1802", // Conseil et maîtrise d'ouvrage en systèmes d'information
      "M1803", // Direction des systèmes d'information
      "M1804", // Études et développement de réseaux de télécoms
      "M1805", // Études et développement informatique
      "M1806", // Expertise et support technique en systèmes d'information
      "M1810", // Production et exploitation de systèmes d'information
      // Ajoutés le 01/09/2026, via le code ROME réel renvoyé par l'API (voir note en tête de
      // fichier) — absents des référentiels ROME publics consultés (probables codes ROME 4.0
      // récents), confirmés par l'intitulé du poste correspondant :
      "M1830", // Code renvoyé pour "Administrateur Réseau & Sécurité" (FAYAT IT).
      "M1851", // Code renvoyé pour "Data analyste (Alternant)" (AIRBUS).
      "M1886", // Code renvoyé pour "Consultant Fonctionnel Web" (FAYAT IT).
    ],
  },
  {
    key: "compta",
    label: "Comptabilité & Gestion",
    romes: [
      "M1201", // Analyse et ingénierie financière
      "M1202", // Audit et contrôle comptables et financiers
      "M1203", // Comptabilité
      "M1204", // Contrôle de gestion
      "M1205", // Direction administrative et financière
      "M1206", // Management de groupe ou de service comptable
      "M1207", // Trésorerie et financement
      // Ajouté le 01/09/2026 : "Responsable contrôle de gestion" — confirmé via une fiche ROME
      // officielle (mescoachsreconversion.fr/metier/m1208). Coexiste avec M1204 (Contrôle de
      // gestion) : les deux sont envoyés, l'API semble utiliser M1208 pour certaines offres.
      "M1208",
    ],
  },
  {
    key: "admin",
    label: "Administratif & Secrétariat",
    romes: [
      "M1601", // Accueil et renseignements
      "M1602", // Opérations administratives
      "M1604", // Assistanat de direction
      "M1605", // Assistanat technique et administratif
      "M1606", // Saisie de données
      "M1607", // Secrétariat
      "M1608", // Secrétariat comptable
      // Ajouté le 01/09/2026 : code renvoyé par l'API pour "Assistant administratif paie"
      // (GROUPE NICOLLIN) — absent des référentiels ROME publics consultés (probable code
      // ROME 4.0 récent), confirmé par l'intitulé du poste.
      "M1621",
    ],
  },
  {
    key: "immobilier",
    label: "Immobilier",
    romes: [
      "C1501", // Gérance immobilière
      "C1502", // Gestion locative immobilière
      "C1503", // Management de projet immobilier
      "C1504", // Transaction immobilière
    ],
  },
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
