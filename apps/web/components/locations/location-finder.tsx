"use client";

import { useMemo, useState } from "react";

import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type CompanyBranchLocation } from "@/lib/company/types";

type LocationFinderProps = {
  locations: CompanyBranchLocation[];
};

type GeoStatus = "idle" | "locating" | "found" | "blocked" | "unsupported";

function distanceKm(
  pointA: { latitude: number; longitude: number },
  pointB: { latitude: number; longitude: number },
) {
  const radiusKm = 6371;
  const latDelta = ((pointB.latitude - pointA.latitude) * Math.PI) / 180;
  const lonDelta = ((pointB.longitude - pointA.longitude) * Math.PI) / 180;
  const latA = (pointA.latitude * Math.PI) / 180;
  const latB = (pointB.latitude * Math.PI) / 180;

  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(lonDelta / 2) ** 2;
  return radiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function LocationFinder({ locations }: LocationFinderProps) {
  const [selectedId, setSelectedId] = useState(locations[0]?.id ?? "");
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");

  const selectedLocation = useMemo(
    () => locations.find((entry) => entry.id === selectedId) ?? locations[0],
    [locations, selectedId],
  );

  function findNearestLocation() {
    if (!("geolocation" in navigator)) {
      setGeoStatus("unsupported");
      return;
    }

    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        const nearest = locations
          .filter((entry) => entry.coordinates)
          .map((entry) => ({
            location: entry,
            distance: distanceKm(userPoint, entry.coordinates!),
          }))
          .sort((a, b) => a.distance - b.distance)[0]?.location;

        if (nearest) {
          setSelectedId(nearest.id);
          setGeoStatus("found");
        } else {
          setGeoStatus("unsupported");
        }
      },
      () => setGeoStatus("blocked"),
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 8000 },
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-kicker">Branch Contacts</p>
            <h2 className="mt-3 text-2xl font-semibold text-neutral-900">
              Contact locations across key cities.
            </h2>
          </div>
          <button
            type="button"
            onClick={findNearestLocation}
            className={buttonClassName({ variant: "secondary", size: "sm" })}
          >
            Find nearest location
          </button>
        </div>

        <div
          className="relative min-h-[20rem] overflow-hidden rounded-[1.5rem] border border-[color:var(--border)] bg-[radial-gradient(circle_at_30%_20%,rgba(244,228,9,0.18),transparent_28%),linear-gradient(145deg,rgba(90,36,122,0.12),rgba(255,255,255,0.7))] p-4"
          aria-label="Interactive list of De-Nest Bread contact locations"
        >
          <svg
            viewBox="0 0 100 100"
            role="img"
            aria-label="Stylized Nigeria contact location map"
            className="absolute inset-5 h-[calc(100%-2.5rem)] w-[calc(100%-2.5rem)] text-[color:var(--brand-1)] opacity-20"
          >
            <path
              d="M42 8 58 12 67 24 78 28 83 43 75 57 78 69 64 85 48 90 37 82 25 79 18 66 13 53 20 40 17 27 29 19Z"
              fill="currentColor"
            />
          </svg>

          {locations.map((location) => (
            <button
              key={location.id}
              type="button"
              aria-pressed={location.id === selectedLocation?.id}
              onClick={() => setSelectedId(location.id)}
              className="absolute z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-[color:var(--brand-1)] text-[10px] font-black text-white shadow-[0_10px_24px_rgba(46,18,69,0.24)] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
              style={{ left: `${location.marker.x}%`, top: `${location.marker.y}%` }}
            >
              {location.state.slice(0, 2).toUpperCase()}
              <span className="sr-only">{location.name}</span>
            </button>
          ))}

          <div className="absolute bottom-4 left-4 right-4 z-10 rounded-[1.2rem] border border-white/70 bg-white/82 p-4 shadow-[0_14px_32px_rgba(46,18,69,0.12)] backdrop-blur">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
              {selectedLocation?.state}
            </p>
            <p className="mt-1 text-base font-semibold text-neutral-900">
              {selectedLocation?.name}
            </p>
            {selectedLocation?.address ? (
              <p className="mt-1 text-xs leading-5 text-neutral-600">
                {selectedLocation.address}
              </p>
            ) : null}
          </div>
        </div>

        <p className="text-xs leading-5 text-neutral-500" aria-live="polite">
          {geoStatus === "idle" ? "Select a marker or use browser location to choose a branch." : null}
          {geoStatus === "locating" ? "Checking your approximate location..." : null}
          {geoStatus === "found" ? "Nearest contact location selected." : null}
          {geoStatus === "blocked" ? "Location access was not allowed. You can still choose a city manually." : null}
          {geoStatus === "unsupported" ? "Browser location is unavailable. Choose a city manually." : null}
        </p>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="section-kicker">Selected Location</p>
          <h3 className="mt-3 text-2xl font-semibold text-neutral-900">
            {selectedLocation?.name}
          </h3>
          {selectedLocation?.address ? (
            <p className="mt-2 text-sm leading-7 text-neutral-600">
              {selectedLocation.address}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Phone</p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">
              {selectedLocation?.phone ?? "Use the head office line"}
            </p>
          </div>
          <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Hours</p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">
              {selectedLocation?.hours ?? "Business hours vary by location"}
            </p>
          </div>
        </div>

        {selectedLocation?.notes ? (
          <p className="rounded-[1rem] border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-4 py-3 text-xs leading-5 text-neutral-500">
            {selectedLocation.notes}
          </p>
        ) : null}

        <a
          href={selectedLocation?.mapUrl}
          target="_blank"
          rel="noreferrer"
          className={buttonClassName({ variant: "primary", size: "sm" })}
        >
          Open map
        </a>

        <div className="grid max-h-[18rem] gap-2 overflow-auto pr-1">
          {locations.map((location) => (
            <button
              key={location.id}
              type="button"
              onClick={() => setSelectedId(location.id)}
              className="rounded-[1rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-left text-sm transition hover:border-[color:var(--border-strong)]"
            >
              <span className="font-semibold text-neutral-900">{location.city}</span>
              <span className="text-neutral-500"> · {location.state}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
