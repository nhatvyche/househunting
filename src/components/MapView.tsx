"use client";

import dynamic from "next/dynamic";
import type { Listing } from "@/lib/types";

const ListingsMap = dynamic(
  () => import("@/components/ListingsMap").then((m) => m.ListingsMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[480px] animate-pulse rounded-xl bg-[var(--surface-2)]" />
    ),
  },
);

export function MapView({
  listings,
  focusId,
}: {
  listings: Listing[];
  focusId?: string | null;
}) {
  return <ListingsMap listings={listings} focusId={focusId} />;
}
