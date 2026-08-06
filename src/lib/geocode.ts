// Géocodage d'une ville ou d'un code postal via l'API Adresse (Base Adresse Nationale) — un
// service public gratuit et sans authentification. Utilisable aussi bien côté navigateur
// (page de recherche) que depuis une fonction serveur (cron des emails).
export interface GeocodedLocation {
  label: string;
  latitude: number;
  longitude: number;
}

export async function geocodeCity(query: string): Promise<GeocodedLocation | null> {
  const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`);
  if (!res.ok) return null;
  const data = await res.json();
  const feature = data?.features?.[0];
  if (!feature) return null;
  const [longitude, latitude] = feature.geometry.coordinates;
  return { label: feature.properties.label, latitude, longitude };
}
