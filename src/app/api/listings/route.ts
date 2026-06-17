import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enrichListing } from "@/lib/parse-listing";
import type { ListingSource } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const url = body.url?.trim();
  const notes = body.notes?.trim() || null;
  const source = (body.source as ListingSource) || "web";

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const { data: parsed, status } = await enrichListing(url);

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      user_id: user.id,
      url,
      source,
      notes: notes ?? parsed.notes ?? null,
      status,
      title: parsed.title ?? null,
      address: parsed.address ?? null,
      city: parsed.city ?? null,
      state: parsed.state ?? null,
      zip: parsed.zip ?? null,
      price: parsed.price ?? null,
      bedrooms: parsed.bedrooms ?? null,
      bathrooms: parsed.bathrooms ?? null,
      sqft: parsed.sqft ?? null,
      lat: parsed.lat ?? null,
      lng: parsed.lng ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listing });
}
