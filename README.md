# HouseHunting Prototype

A per-user property listing tracker built as a **separate prototype** from the existing Gmail + Google Sheets system.

Full intended workflow (find → manage users/groups → review): see [`WORKFLOW.md`](./WORKFLOW.md).

## What it does

- **Shared inbox**: Users email listings to one address (e.g. `househunting.betatest@gmail.com`)
- **Sender tracking**: Each listing is tied to the submitter's email
- **Private dashboard**: Logged-in users see only their own listings
- **Map view**: Filtered map of the current user's saved properties
- **Web submit**: Paste a listing URL directly on the site

## Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 16 + Tailwind |
| Auth & DB | Supabase (Postgres + RLS + magic link login) |
| Map | Leaflet + OpenStreetMap |
| Email ingest | Gmail Apps Script → `/api/ingest` |
| Parsing (optional) | Claude API |

## Quick start

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor
3. Under **Authentication → URL configuration**, add:
   - Site URL: `http://localhost:3000` (or your deploy URL)
   - Redirect URLs: `http://localhost:3000/auth/callback`
4. Copy project URL, anon key, and service role key

### 2. Environment

```bash
cp .env.local.example .env.local
# Fill in Supabase keys and generate INGEST_API_KEY
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up with magic link, and add a listing.

### 4. Email ingest (optional)

1. Create `househunting.betatest@gmail.com` (or your chosen shared inbox)
2. Deploy `scripts/gmail-ingest.gs` in Apps Script on that account
3. Set Script Properties: `INGEST_URL`, `INGEST_API_KEY`
4. Run `createTrigger()` once
5. Testers must **sign up on the website first** so their sender email exists in `profiles`

### 5. Deploy

Deploy to [Vercel](https://vercel.com) and set the same env vars. Update Supabase redirect URLs to your production domain.

## Architecture

```
Chrome extension / Gmail
        ↓ email with listing URL
Shared Gmail inbox
        ↓ Apps Script (every 10 min)
POST /api/ingest  (x-api-key)
        ↓ match sender → profiles.email
Supabase listings table (user_id FK)
        ↓ RLS: auth.uid() = user_id
Next.js dashboard + map (per user)
```

## Key differences from the current system

| Current (partner) | This prototype |
|-------------------|----------------|
| Personal Gmail address | Shared beta inbox |
| Google Sheets (all listings) | Postgres with per-user RLS |
| One map for everyone | Map filtered by logged-in user |
| No submitter tracking | `user_id` + sender email matching |

## API

### `POST /api/ingest` (Apps Script)

Headers: `x-api-key: <INGEST_API_KEY>`

```json
{
  "senderEmail": "user@example.com",
  "subject": "Nice place",
  "body": "https://www.zillow.com/...",
  "source": "email"
}
```

### `POST /api/listings` (authenticated web UI)

Session cookie required. Body: `{ "url": "...", "notes": "...", "source": "web" }`

## Feedback goals

This is a free beta for known testers. Gather feedback on:

- Email → dashboard flow reliability
- Parsing quality (with/without Claude)
- Map usefulness for comparing neighborhoods
- Whether per-user views feel right vs. a shared spreadsheet
