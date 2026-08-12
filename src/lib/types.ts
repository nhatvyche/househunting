export type ListingStatus = "pending" | "parsed" | "error";
export type ListingSource = "web" | "email" | "extension";

export interface Listing {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  lat: number | null;
  lng: number | null;
  status: ListingStatus;
  source: ListingSource;
  notes: string | null;
  raw_email_subject: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParsedListingData {
  title?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  price?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqft?: number | null;
  lat?: number | null;
  lng?: number | null;
  notes?: string | null;
}

export interface ListingComment {
  id: string;
  listing_id: string;
  user_id: string;
  body: string;
  created_at: string;
}
