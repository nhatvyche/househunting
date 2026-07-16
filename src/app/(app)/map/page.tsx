import { createClient } from "@/lib/supabase/server";
import { MapView } from "@/components/MapView";
import type { Listing } from "@/lib/types";

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string }>;
}) {
  const { focus } = await searchParams;
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  const items = (listings ?? []) as Listing[];
  const mappable = items.filter((l) => l.lat != null && l.lng != null);
  const pending = items.length - mappable.length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary)]">Your map</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Showing {mappable.length} of {items.length} listings with location data
        </p>
        {pending > 0 && (
          <p className="mt-2 text-sm text-amber-800">
            {pending} listing{pending === 1 ? "" : "s"} missing a map pin — re-add with an address on
            the Add page, or enable AI parsing with <code className="rounded bg-amber-100 px-1">ANTHROPIC_API_KEY</code>.
          </p>
        )}
      </div>
      <MapView listings={items} focusId={focus ?? null} />
    </div>
  );
}
