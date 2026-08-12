import Link from "next/link";
import { ExternalLink, MapPin, MessageSquare } from "lucide-react";
import type { Listing } from "@/lib/types";
import {
  formatAddress,
  formatBaths,
  formatBeds,
  formatDate,
  formatPrice,
  formatSqft,
  listingLabel,
} from "@/lib/format";

const statusStyles: Record<Listing["status"], string> = {
  parsed: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  error: "bg-red-100 text-red-800",
};

export function ListingCard({
  listing,
  commentCount = 0,
}: {
  listing: Listing;
  commentCount?: number;
}) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/listings/${listing.id}`}
            className="truncate font-semibold text-[var(--foreground)] hover:text-[var(--primary)] hover:underline"
          >
            {listingLabel(listing)}
          </Link>
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
        <span>{formatBeds(listing.bedrooms)}</span>
        <span>{formatBaths(listing.bathrooms)}</span>
        <span>{formatSqft(listing.sqft)}</span>
      </div>

      {listing.notes && (
        <p className="mb-3 line-clamp-2 text-sm text-[var(--muted)]">{listing.notes}</p>
      )}

      <div className="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
        <span>
          via {listing.source} · {formatDate(listing.created_at)}
        </span>
        <div className="flex gap-2">
          <Link
            href={`/listings/${listing.id}`}
            className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
          >
            <MessageSquare className="h-3 w-3" />
            {commentCount > 0 ? commentCount : "Comment"}
          </Link>
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
