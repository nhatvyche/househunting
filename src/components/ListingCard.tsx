import Link from "next/link";
import { ExternalLink, MapPin, MessageSquare } from "lucide-react";
import type { Listing } from "@/lib/types";
import { hydrateListingFromUrl } from "@/lib/parse-listing";
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
  const item = hydrateListingFromUrl(listing);

  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/listings/${item.id}`}
            className="truncate font-semibold text-[var(--foreground)] hover:text-[var(--primary)] hover:underline"
          >
            {listingLabel(item)}
          </Link>
          <p className="mt-1 text-sm text-[var(--muted)]">{formatAddress(item)}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[item.status]}`}
        >
          {item.status}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
        <span className="font-medium text-[var(--primary)]">{formatPrice(item.price)}</span>
        <span>{formatBeds(item.bedrooms)}</span>
        <span>{formatBaths(item.bathrooms)}</span>
        <span>{formatSqft(item.sqft)}</span>
      </div>

      {item.notes && (
        <p className="mb-3 line-clamp-2 text-sm text-[var(--muted)]">{item.notes}</p>
      )}

      <div className="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
        <span>
          via {item.source} · {formatDate(item.created_at)}
        </span>
        <div className="flex gap-2">
          <Link
            href={`/listings/${item.id}`}
            className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
          >
            <MessageSquare className="h-3 w-3" />
            {commentCount > 0 ? commentCount : "Comment"}
          </Link>
          {item.lat != null && item.lng != null && (
            <Link
              href={`/map?focus=${item.id}`}
              className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
            >
              <MapPin className="h-3 w-3" />
              Map
            </Link>
          )}
          <a
            href={item.url}
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
