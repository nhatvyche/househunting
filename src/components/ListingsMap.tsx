"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { Listing } from "@/lib/types";
import {
  appleMapsUrl,
  directionsUrl,
  formatBaths,
  formatBeds,
  formatPrice,
  formatSqft,
  listingLabel,
} from "@/lib/format";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitBounds({ listings }: { listings: Listing[] }) {
  const map = useMap();

  useEffect(() => {
    const points = listings.filter((l) => l.lat != null && l.lng != null);
    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView([points[0].lat!, points[0].lng!], 14);
      return;
    }

    const bounds = L.latLngBounds(
      points.map((l) => [l.lat!, l.lng!] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [listings, map]);

  return null;
}

function FocusMarker({ listing }: { listing: Listing | null }) {
  const map = useMap();

  useEffect(() => {
    if (listing?.lat != null && listing?.lng != null) {
      map.setView([listing.lat, listing.lng], 15);
    }
  }, [listing, map]);

  return null;
}

export function ListingsMap({
  listings,
  focusId,
}: {
  listings: Listing[];
  focusId?: string | null;
}) {
  const mappable = listings.filter((l) => l.lat != null && l.lng != null);
  const focusListing = focusId
    ? mappable.find((l) => l.id === focusId) ?? null
    : null;

  if (mappable.length === 0) {
    return (
      <div className="flex h-[480px] items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]">
        No listings with location data yet. Parsed addresses will appear here.
      </div>
    );
  }

  const center: [number, number] = [mappable[0].lat!, mappable[0].lng!];

  return (
    <div className="h-[480px] overflow-hidden rounded-xl border border-[var(--border)] shadow-sm">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full"
      >
        {/* Carto Positron: cleaner basemap, fewer red highway exit labels */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds listings={mappable} />
        <FocusMarker listing={focusListing} />
        {mappable.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.lat!, listing.lng!]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="min-w-[180px] space-y-1.5 text-sm">
                <p className="font-semibold">{listingLabel(listing)}</p>
                <p className="font-medium text-[var(--primary)]">
                  {formatPrice(listing.price)}
                </p>
                <p className="text-[var(--muted)]">
                  {formatBeds(listing.bedrooms)} · {formatBaths(listing.bathrooms)} ·{" "}
                  {formatSqft(listing.sqft)}
                </p>
                <div className="flex flex-col gap-1 pt-1">
                  <a
                    href={directionsUrl(
                      listing.lat!,
                      listing.lng!,
                      listing.address || listingLabel(listing),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Get directions
                  </a>
                  <a
                    href={appleMapsUrl(
                      listing.lat!,
                      listing.lng!,
                      listing.address || listingLabel(listing),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open in Apple Maps
                  </a>
                  <a
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open listing
                  </a>
                  <a
                    href={`/listings/${listing.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Details & comments
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
