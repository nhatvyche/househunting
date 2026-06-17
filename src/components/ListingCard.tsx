import Link from "next/link";
import { ExternalLink, MapPin } from "lucide-react";
import type { Listing } from "@/lib/types";
import { formatAddress, formatDate, formatPrice, listingLabel } from "@/lib/format";

const statusStyles: Record<Listing["status"], string> = {
  parsed: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  error: "bg-red-100 text-red-800",
};

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-[var(--foreground)]">
            {listingLabel(listing)}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{formatAddress(listing)}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[listing.status]}`}
        >
          {listing.status}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
        <span className="font-medium text-[var(--primary)]">{formatPrice(listing.price)}</span>
        {listing.bedrooms != null && <span>{listing.bedrooms} bed</span>}
        {listing.bathrooms != null && <span>{listing.bathrooms} bath</span>}
        {listing.sqft != null && <span>{listing.sqft.toLocaleString()} sqft</span>}
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
        <span>
          via {listing.source} · {formatDate(listing.created_at)}
        </span>
        <div className="flex gap-2">
          {listing.lat != null && listing.lng != null && (
            <Link
              href={`/map?focus=${listing.id}`}
              className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
            >
              <MapPin className="h-3 w-3" />
              Map
            </Link>
          )}
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            View
          </a>
        </div>
      </div>
    </article>
  );
}
