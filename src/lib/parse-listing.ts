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
            content: `Extract property listing data from this URL: ${url}

Return ONLY valid JSON with these fields (use null if unknown):
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
  const parsed = await parseListingWithAI(url);

  if (!parsed) {
    return {
      data: { title: new URL(url).hostname },
      status: "pending",
    };
  }

  if (!parsed.lat && parsed.address) {
    const coords = await geocodeAddress(
      parsed.address,
      parsed.city,
      parsed.state,
      parsed.zip,
    );
    if (coords) {
      parsed.lat = coords.lat;
      parsed.lng = coords.lng;
    }
  }

  return { data: parsed, status: "parsed" };
}
