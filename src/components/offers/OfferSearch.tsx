"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Form";
import { SECTOR_OPTIONS, SEARCH_RADIUS_OPTIONS, sectorsToRomeCodes } from "@/lib/romeSecteurs";
import { geocodeCity, type GeocodedLocation } from "@/lib/geocode";
import { createClient } from "@/lib/supabase/client";
import type { OfferResult } from "@/lib/labonnealternance";

interface OfferSearchProps {
  userId: string;
  initialCity: string;
  initialSectors: string[];
  initialRadius: number;
  initialNotify: boolean;
}

export function OfferSearch({ userId, initialCity, initialSectors, initialRadius, initialNotify }: OfferSearchProps) {
  const [cityInput, setCityInput] = useState(initialCity);
  const [selectedSectors, setSelectedSectors] = useState<string[]>(initialSectors);
  const [radius, setRadius] = useState(initialRadius);
  const [notifyNewOffers, setNotifyNewOffers] = useState(initialNotify);
  const [savingNotify, setSavingNotify] = useState(false);
  const [notifySaved, setNotifySaved] = useState(false);
  const [location, setLocation] = useState<GeocodedLocation | null>(null);
  const [offers, setOffers] = useState<OfferResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const supabase = createClient();

  function toggleSector(key: string) {
    setSelectedSectors((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  // Enregistre la préférence ET les critères actuels — appelée à la fois quand on coche/décoche
  // la case, et après chaque recherche réussie tant que la case est cochée. C'est ce qui garantit
  // que l'alerte du lendemain porte toujours sur la dernière recherche affichée à l'écran, jamais
  // sur une ville ou des secteurs qu'on aurait changés depuis sans y repenser.
  async function syncNotificationPreference(checked: boolean) {
    setNotifyNewOffers(checked);
    setNotifySaved(false);
    setSavingNotify(true);

    const payload: Record<string, unknown> = { id: userId, notify_new_offers: checked };
    if (checked) {
      payload.target_city = cityInput.trim();
      payload.target_sectors = selectedSectors;
      payload.search_radius = radius;
    }

    const { error: saveError } = await supabase.from("profiles").upsert(payload);
    setSavingNotify(false);
    if (!saveError) setNotifySaved(true);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!cityInput.trim()) {
      setError("Indiquez une ville ou un code postal.");
      return;
    }
    if (selectedSectors.length === 0) {
      setError("Sélectionnez au moins un secteur.");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const geo = await geocodeCity(cityInput.trim());
      if (!geo) {
        setError("Ville introuvable, essayez avec un code postal ou une orthographe différente.");
        setOffers(null);
        return;
      }
      setLocation(geo);

      const romes = sectorsToRomeCodes(selectedSectors);
      const params = new URLSearchParams({
        lat: geo.latitude.toString(),
        lon: geo.longitude.toString(),
        radius: radius.toString(),
      });
      romes.forEach((code) => params.append("rome", code));

      const res = await fetch(`/api/offers/search?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Impossible de récupérer les offres pour le moment.");
        setOffers(null);
        return;
      }
      setOffers(data.offers);

      if (notifyNewOffers) {
        await syncNotificationPreference(true);
      }
    } catch {
      setError("Une erreur est survenue pendant la recherche.");
      setOffers(null);
    } finally {
      setLoading(false);
    }
  }

  function buildAddUrl(offer: OfferResult) {
    const params = new URLSearchParams({
      prefillCompany: offer.company,
      prefillRole: offer.title,
    });
    if (offer.applyUrl) params.set("prefillUrl", offer.applyUrl);
    if (offer.description) params.set("prefillDescription", offer.description);
    return `/dashboard/applications?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="city">Ville ou code postal</Label>
              <Input
                id="city"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Ex : Bordeaux ou 33000"
              />
            </div>
            <div>
              <Label htmlFor="radius">Rayon de recherche</Label>
              <Select id="radius" value={radius} onChange={(e) => setRadius(parseInt(e.target.value, 10))}>
                {SEARCH_RADIUS_OPTIONS.map((km) => (
                  <option key={km} value={km}>
                    {km} km
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label>Secteurs</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SECTOR_OPTIONS.map((sector) => {
                const active = selectedSectors.includes(sector.key);
                return (
                  <button
                    key={sector.key}
                    type="button"
                    onClick={() => toggleSector(sector.key)}
                    className={
                      active
                        ? "rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-white"
                        : "rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink/70 hover:border-primary-200 hover:bg-primary-50"
                    }
                  >
                    {sector.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-start gap-2.5 rounded-xl border border-line px-3.5 py-3">
            <input
              type="checkbox"
              checked={notifyNewOffers}
              onChange={(e) => syncNotificationPreference(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-line"
            />
            <span className="text-sm text-ink">
              <span className="font-medium">M&apos;avertir par email des nouvelles offres</span>
              <br />
              <span className="text-xs text-muted">
                Un email quotidien si de nouvelles offres correspondant à ces critères sont
                publiées. Se met à jour à chaque recherche tant que la case reste cochée.
                {savingNotify && " Enregistrement..."}
                {!savingNotify && notifySaved && " Préférence enregistrée ✓"}
              </span>
            </span>
          </label>

          {error && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Recherche en cours..." : "Rechercher des offres"}
          </Button>
        </form>
      </Card>

      {hasSearched && !loading && offers && (
        <div>
          <p className="mb-3 text-sm text-muted">
            {offers.length === 0
              ? "Aucune offre trouvée pour ces critères — essayez d'élargir le rayon ou les secteurs."
              : `${offers.length} offre(s) trouvée(s) autour de ${location?.label ?? cityInput}.`}
          </p>

          <div className="space-y-3">
            {offers.map((offer) => (
              <Card key={offer.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-semibold text-ink">{offer.title}</p>
                    <p className="mt-0.5 text-sm text-muted">
                      {offer.company}
                      {offer.city ? ` · ${offer.city}` : ""}
                    </p>
                    {offer.isSpontaneous && (
                      <span className="mt-2 inline-block rounded-full bg-accent-50 px-2.5 py-1 text-xs font-medium text-accent-600">
                        À fort potentiel — candidature spontanée conseillée
                      </span>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {offer.applyUrl && (
                      <a
                        href={offer.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Voir l&apos;offre
                      </a>
                    )}
                    <Link href={buildAddUrl(offer)}>
                      <Button size="sm" variant="secondary">
                        + Ajouter à mes candidatures
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
