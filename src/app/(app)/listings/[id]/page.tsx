import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, Navigation } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CommentsSection } from "@/components/CommentsSection";
import {
  appleMapsUrl,
  directionsUrl,
  formatAddress,
  formatBaths,
  formatBeds,
  formatDate,
  formatPrice,
  formatSqft,
  listingLabel,
} from "@/lib/format";
import type { Listing, ListingComment } from "@/lib/types";
import { backfillListingsFromUrls } from "@/lib/backfill-listings";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !listing) notFound();

  const [item] = await backfillListingsFromUrls([listing as Listing], 1);

  const { data: comments } = await supabase
    .from("listing_comments")
    .select("*")
    .eq("listing_id", id)
    .order("created_at", { ascending: true });

  const label = listingLabel(item);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[var(--primary)]">{label}</h1>
        <p className="text-[var(--muted)]">{formatAddress(item)}</p>
        <p className="text-xl font-semibold text-[var(--foreground)]">
          {formatPrice(item.price)}
        </p>
        <p className="text-sm text-[var(--muted)]">
          {formatBeds(item.bedrooms)} · {formatBaths(item.bathrooms)} ·{" "}
          {formatSqft(item.sqft)}
        </p>
        <p className="text-xs text-[var(--muted)]">
          via {item.source} · added {formatDate(item.created_at)} · status{" "}
          <span className="capitalize">{item.status}</span>
        </p>
      </header>

      {item.notes && (
        <section className="rounded-xl border border-[var(--border)] bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold">Notes</h2>
          <p className="whitespace-pre-wrap text-sm text-[var(--muted)]">{item.notes}</p>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
        >
          <ExternalLink className="h-4 w-4" />
          Open listing
        </a>
        {item.lat != null && item.lng != null && (
          <>
            <a
              href={directionsUrl(item.lat, item.lng, item.address || label)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]"
            >
              <Navigation className="h-4 w-4" />
              Get directions
            </a>
            <a
              href={appleMapsUrl(item.lat, item.lng, item.address || label)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]"
            >
              Apple Maps
            </a>
            <Link
              href={`/map?focus=${item.id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]"
            >
              <MapPin className="h-4 w-4" />
              Show on map
            </Link>
          </>
        )}
      </div>

      <CommentsSection
        listingId={item.id}
        initialComments={(comments ?? []) as ListingComment[]}
      />
    </div>
  );
}
