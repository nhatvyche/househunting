import type { Listing } from "@/lib/types";

export function formatPrice(price: number | null): string {
  if (price == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatAddress(listing: Listing): string {
  const parts = [
    listing.address,
    [listing.city, listing.state].filter(Boolean).join(", "),
    listing.zip,
  ].filter(Boolean);
  return parts.join(" · ") || "Address pending";
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function listingLabel(listing: Listing): string {
  return listing.title || listing.address || new URL(listing.url).hostname;
}

export function formatBeds(bedrooms: number | null): string {
  return bedrooms == null ? "— bed" : `${bedrooms} bed`;
}

export function formatBaths(bathrooms: number | null): string {
  return bathrooms == null ? "— bath" : `${bathrooms} bath`;
}

export function formatSqft(sqft: number | null): string {
  return sqft == null ? "— sqft" : `${sqft.toLocaleString()} sqft`;
}

/** Opens Apple Maps / Google Maps on the user's device for driving directions. */
export function directionsUrl(lat: number, lng: number, label?: string | null): string {
  const q = encodeURIComponent(label || `${lat},${lng}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving&q=${q}`;
}

export function appleMapsUrl(lat: number, lng: number, label?: string | null): string {
  const q = encodeURIComponent(label || `${lat},${lng}`);
  return `https://maps.apple.com/?daddr=${lat},${lng}&q=${q}`;
}
