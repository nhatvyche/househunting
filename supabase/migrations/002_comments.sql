-- Comments on listings (run in Supabase SQL editor if schema already applied)

create table if not exists public.listing_comments (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists listing_comments_listing_id_idx
  on public.listing_comments (listing_id, created_at desc);

alter table public.listing_comments enable row level security;

create policy "Users can view comments on own listings"
  on public.listing_comments for select
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_comments.listing_id
        and listings.user_id = auth.uid()
    )
  );

create policy "Users can insert comments on own listings"
  on public.listing_comments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.listings
      where listings.id = listing_comments.listing_id
        and listings.user_id = auth.uid()
    )
  );

create policy "Users can delete own comments"
  on public.listing_comments for delete
  using (auth.uid() = user_id);
