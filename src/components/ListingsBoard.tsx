"use client";

import { useMemo, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import type { Listing } from "@/lib/types";

type SortKey = "newest" | "oldest" | "price_asc" | "price_desc" | "beds_desc";

export function ListingsBoard({
  listings,
  commentCounts,
}: {
  listings: Listing[];
  commentCounts: Record<string, number>;
}) {
  const [sort, setSort] = useState<SortKey>("newest");
  const [minBeds, setMinBeds] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let items = [...listings];

    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter((l) => {
        const hay = [
          l.title,
          l.address,
          l.city,
          l.state,
          l.zip,
          l.notes,
          l.url,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    const beds = minBeds ? Number(minBeds) : null;
    if (beds != null && !Number.isNaN(beds)) {
      items = items.filter((l) => (l.bedrooms ?? 0) >= beds);
    }

    const priceCap = maxPrice ? Number(maxPrice) : null;
    if (priceCap != null && !Number.isNaN(priceCap)) {
      items = items.filter((l) => l.price != null && l.price <= priceCap);
    }

    items.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "price_asc":
          return (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY);
        case "price_desc":
          return (b.price ?? -1) - (a.price ?? -1);
        case "beds_desc":
          return (b.bedrooms ?? -1) - (a.bedrooms ?? -1);
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return items;
  }, [listings, sort, minBeds, maxPrice, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-white p-4">
        <div className="min-w-[160px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-[var(--muted)]">
            Search
          </label>
          <input
            id="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Address, city, notes…"
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div>
          <label htmlFor="sort" className="mb-1 block text-xs font-medium text-[var(--muted)]">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="beds_desc">Most bedrooms</option>
          </select>
        </div>
        <div>
          <label htmlFor="minBeds" className="mb-1 block text-xs font-medium text-[var(--muted)]">
            Min beds
          </label>
          <select
            id="minBeds"
            value={minBeds}
            onChange={(e) => setMinBeds(e.target.value)}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>
        <div>
          <label htmlFor="maxPrice" className="mb-1 block text-xs font-medium text-[var(--muted)]">
            Max price
          </label>
          <input
            id="maxPrice"
            type="number"
            min={0}
            step={10000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Any"
            className="w-32 rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>

      <p className="text-sm text-[var(--muted)]">
        Showing {filtered.length} of {listings.length}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-white p-8 text-center text-sm text-[var(--muted)]">
          No listings match these filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              commentCount={commentCounts[listing.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
