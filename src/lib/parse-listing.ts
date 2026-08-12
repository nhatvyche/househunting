import type { ParsedListingData } from "@/lib/types";

const URL_PATTERN =
  /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_PATTERN) ?? [];
  return [...new Set(matches.map((url) => url.replace(/[>,)\]"']+$/, "")))];
}

export function extractListingUrl(subject: string, body: string): string | null {
  const combined = `${subject}\n${body}`;
  const urls = extractUrls(combined);
  const listingUrl = urls.find(
    (url) =>
      !url.includes("google.com/maps") &&
      !url.includes("mailto:") &&
      !url.includes("unsubscribe"),
  );
  return listingUrl ?? urls[0] ?? null;
}

/** Turn "San-Jose" / "McLaughlin-Ave" into spaced words. */
function unslug(part: string): string {
  return part.replace(/-+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Realtor.com paths look like:
 * /rentals/details/1150-McLaughlin-Ave_San-Jose_CA_95122_M17828-21201
 * /realestateandhomes-detail/123-Main-St_Austin_TX_78701_M12345-67890
 */
function extractFromRealtorSlug(pathname: string): ParsedListingData | null {
  const segment = pathname.split("/").filter(Boolean).pop() ?? "";
  // street_city_ST_ZIP_M...
  const match = segment.match(
    /^(\d[\w-]*)_([A-Za-z][\w-]*)_([A-Za-z]{2})_(\d{5})(?:-\d{4})?(?:_M[\w-]+)?$/i,
  );
  if (!match) return null;

  const address = unslug(match[1]);
  const city = unslug(match[2]);
  const state = match[3].toUpperCase();
  const zip = match[4];

  return {
    title: `${address}, ${city}, ${state} ${zip}`,
    address,
    city,
    state,
    zip,
  };
}

/** Best-effort parse of street/city/state/zip from common listing URL paths. */
export function extractAddressFromUrl(url: string): ParsedListingData | null {
  try {
    const { pathname, hostname } = new URL(url);

    if (hostname.includes("realtor.com")) {
      const realtor = extractFromRealtorSlug(pathname);
      if (realtor) return realtor;
    }

    // Keep underscores as separators first (Realtor / some aggregators)
    const underscoreParts = (pathname.split("/").filter(Boolean).pop() ?? "").split("_");
    if (underscoreParts.length >= 4) {
      const zipIdx = underscoreParts.findIndex((p) => /^\d{5}(?:-\d{4})?$/.test(p));
      const stateIdx = zipIdx > 0 ? zipIdx - 1 : -1;
      if (
        zipIdx >= 2 &&
        stateIdx >= 1 &&
        /^[A-Za-z]{2}$/.test(underscoreParts[stateIdx])
      ) {
        const address = unslug(underscoreParts.slice(0, stateIdx - 1).join(" "));
        const city = unslug(underscoreParts[stateIdx - 1]);
        const state = underscoreParts[stateIdx].toUpperCase();
        const zip = underscoreParts[zipIdx].slice(0, 5);
        if (address && city) {
          return {
            title: `${address}, ${city}, ${state} ${zip}`,
            address,
            city,
            state,
            zip,
          };
        }
      }
    }

    const slug = decodeURIComponent(pathname)
      .replace(/\+/g, " ")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // e.g. "123 Main St Austin TX 78701"
    const match = slug.match(
      /(\d{1,6}\s+[A-Za-z0-9 .'#]+?\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court|Way|Pl|Place|Ter|Terrace|Cir|Circle)\.?)(?:\s+([A-Za-z .]+?))?\s+([A-Z]{2})\s+(\d{5})(?:-\d{4})?/i,
    );

    if (match) {
      return {
        title: [match[1], match[2], match[3], match[4]].filter(Boolean).join(", "),
        address: match[1].trim(),
        city: match[2]?.trim() || null,
        state: match[3].toUpperCase(),
        zip: match[4],
      };
    }

    const cityStateZip = slug.match(/([A-Za-z .]+)\s+([A-Z]{2})\s+(\d{5})(?:-\d{4})?/i);
    if (!cityStateZip) return null;

    return {
      title: hostname,
      city: cityStateZip[1].trim(),
      state: cityStateZip[2].toUpperCase(),
      zip: cityStateZip[3],
      address: null,
    };
  } catch {
    return null;
  }
}


export async function parseListingWithAI(
  url: string,
): Promise<ParsedListingData | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are extracting structured real-estate listing data for a house-hunting app.

Listing URL: ${url}

Use the URL (and any address encoded in the path) to infer fields. Prefer accurate street address, city, state, ZIP, price, bedrooms, bathrooms, and square footage when you can reasonably determine them from the listing URL / known listing page patterns.

Return ONLY valid JSON (no markdown) with these fields (use null if unknown):
{
  "title": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zip": "string",
  "price": number,
  "bedrooms": number,
  "bathrooms": number,
  "sqft": number,
  "notes": "string"
}`,
          },
        ],
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]) as ParsedListingData;
  } catch {
    return null;
  }
}

export async function geocodeAddress(
  address: string,
  city?: string | null,
  state?: string | null,
  zip?: string | null,
): Promise<{ lat: number; lng: number } | null> {
  const parts = [address, city, state, zip].filter(Boolean);
  if (parts.length === 0) return null;

  const query = encodeURIComponent(parts.join(", "));
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      {
        headers: { "User-Agent": "HouseHunting/1.0 (prototype)" },
      },
    );
    if (!response.ok) return null;

    const results = await response.json();
    if (!results?.[0]) return null;

    return {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon),
    };
  } catch {
    return null;
  }
}

export async function enrichListing(
  url: string,
): Promise<{ data: ParsedListingData; status: "parsed" | "pending" }> {
  const fromAi = await parseListingWithAI(url);
  const fromUrl = extractAddressFromUrl(url);

  const data: ParsedListingData = {
    title: fromAi?.title ?? fromUrl?.title ?? new URL(url).hostname,
    address: fromAi?.address ?? fromUrl?.address ?? null,
    city: fromAi?.city ?? fromUrl?.city ?? null,
    state: fromAi?.state ?? fromUrl?.state ?? null,
    zip: fromAi?.zip ?? fromUrl?.zip ?? null,
    price: fromAi?.price ?? null,
    bedrooms: fromAi?.bedrooms ?? null,
    bathrooms: fromAi?.bathrooms ?? null,
    sqft: fromAi?.sqft ?? null,
    notes: fromAi?.notes ?? null,
    lat: fromAi?.lat ?? null,
    lng: fromAi?.lng ?? null,
  };

  const hasAddress = Boolean(data.address || (data.city && data.state) || data.zip);

  if (!data.lat && hasAddress) {
    const coords = await geocodeAddress(
      data.address || [data.city, data.state, data.zip].filter(Boolean).join(", "),
      data.city,
      data.state,
      data.zip,
    );
    if (coords) {
      data.lat = coords.lat;
      data.lng = coords.lng;
    }
  }

  const hasFacts =
    data.price != null ||
    data.bedrooms != null ||
    data.bathrooms != null ||
    data.sqft != null ||
    hasAddress;

  return {
    data,
    status: fromAi || (hasFacts && data.lat != null) ? "parsed" : hasFacts ? "parsed" : "pending",
  };
}
