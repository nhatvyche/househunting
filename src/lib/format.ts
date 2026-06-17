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
