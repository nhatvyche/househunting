import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  enrichListing,
  extractListingUrl,
} from "@/lib/parse-listing";
import type { ListingSource } from "@/lib/types";

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.INGEST_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const senderEmail = body.senderEmail?.trim()?.toLowerCase();
  const subject = body.subject?.trim() ?? "";
  const emailBody = body.body?.trim() ?? "";
  const url = body.url?.trim() || extractListingUrl(subject, emailBody);
  const source = (body.source as ListingSource) || "email";

  if (!senderEmail) {
    return NextResponse.json({ error: "senderEmail is required" }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json({ error: "No listing URL found in email" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", senderEmail)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      {
        error: "No registered user for this sender email",
        senderEmail,
        hint: "User must sign up at HouseHunting with the same email they send from",
      },
      { status: 404 },
    );
  }

  const { data: parsed, status } = await enrichListing(url);

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      user_id: profile.id,
      url,
      source,
      status,
      raw_email_subject: subject || null,
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
      notes: parsed.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listing, matchedUser: senderEmail });
}
