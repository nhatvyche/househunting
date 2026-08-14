import { createClient } from "@/lib/supabase/server";
import { extractAddressFromUrl, geocodeAddress } from "@/lib/parse-listing";
import type { Listing } from "@/lib/types";

/** Persist URL-derived address/coords for listings saved before the Realtor parser. */
export async function backfillListingsFromUrls(
  listings: Listing[],
  limit = 8,
): Promise<Listing[]> {
  const supabase = await createClient();
  const updated: Listing[] = [];
  let count = 0;

  for (const listing of listings) {
    const needsAddress = !listing.address || !listing.city || !listing.zip;
    const needsCoords = listing.lat == null || listing.lng == null;
    if (!needsAddress && !needsCoords) {
      updated.push(listing);
      continue;
    }

    const parsed = extractAddressFromUrl(listing.url);
    if (!parsed) {
      updated.push(listing);
      continue;
    }

    if (count >= limit) {
      updated.push({
        ...listing,
        title: listing.title || parsed.title || listing.title,
        address: listing.address || parsed.address || null,
        city: listing.city || parsed.city || null,
        state: listing.state || parsed.state || null,
        zip: listing.zip || parsed.zip || null,
      });
      continue;
    }

    const address = listing.address || parsed.address || null;
    const city = listing.city || parsed.city || null;
    const state = listing.state || parsed.state || null;
    const zip = listing.zip || parsed.zip || null;

    let lat = listing.lat;
    let lng = listing.lng;
    if ((lat == null || lng == null) && (address || city)) {
      count += 1;
      const coords = await geocodeAddress(address || "", city, state, zip);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
      }
    }

    const patch = {
      title: listing.title || parsed.title || listing.title,
      address,
      city,
      state,
      zip,
      lat,
      lng,
      status:
        lat != null && lng != null
          ? "parsed"
          : address
            ? "parsed"
            : listing.status,
    };

    await supabase.from("listings").update(patch).eq("id", listing.id);
    updated.push({ ...listing, ...patch });
  }

  return updated;
}
