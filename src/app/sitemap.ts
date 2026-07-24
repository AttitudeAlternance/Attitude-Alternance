import type { MetadataRoute } from "next";

const BASE_URL = "https://www.attitude-alternance.fr";

const conseilsSlugs = [
  "preparer-entretien-alternance",
  "cv-alternance",
  "relancer-candidature-alternance",
  "reperer-fausse-offre-alternance",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/conseils`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...conseilsSlugs.map((slug) => ({
      url: `${BASE_URL}/conseils/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${BASE_URL}/a-propos`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
    { url: `${BASE_URL}/cgu`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
    { url: `${BASE_URL}/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
  ];
}
