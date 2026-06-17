import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/ListingCard";
import type { Listing } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        Failed to load listings: {error.message}
      </div>
    );
  }

  const items = (listings ?? []) as Listing[];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--primary)]">Your listings</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {items.length} saved {items.length === 1 ? "property" : "properties"}
          </p>
        </div>
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
        >
          <Plus className="h-4 w-4" />
          Add listing
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-white p-12 text-center">
          <p className="text-[var(--muted)]">No listings yet.</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Email a listing URL to the shared inbox, or add one manually.
          </p>
          <Link
            href="/submit"
            className="mt-4 inline-block text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Add your first listing →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
