# HouseHunting Prototype Workflow

This document describes the intended end-to-end workflow for the HouseHunting prototype, and how it maps to the current build.

**Legend**
- Done = available in the current prototype
- Partial = started, not complete
- Planned = not built yet (next iteration)

---

## 1. Find listings

| Step | Status | Notes |
|------|--------|--------|
| User finds a property listing | Done | Outside the app (Realtor, Zillow, etc.) |
| User sends the URL to a dedicated email address | Partial | Shared inbox supported via Apps Script; Chrome extension still points at old system until updated |
| The system receives the email | Partial | `scripts/gmail-ingest.gs` → `POST /api/ingest` |
| The system uses AI to get listing data from the webpage | Partial | Claude when `ANTHROPIC_API_KEY` is set; URL path heuristics + optional manual address as fallback |
| The system enters that listing data into the database | Done | Saved to Supabase `listings` with `user_id` (who submitted) |

### Current alternate path (for beta testing)
Users can paste a listing URL (and optional address) on **Add** (`/submit`) without email.

### Target email flow
```
Find listing → email URL to shared inbox
  → Apps Script (every ~10 min)
  → /api/ingest (match sender email → user)
  → AI extract address/price/beds/etc.
  → geocode → save to listings
```

---

## 2. User management

| Step | Status | Notes |
|------|--------|--------|
| The user creates an account | Done | Magic-link sign-in (Supabase Auth) |
| The user can close the account | Planned | Need delete-account flow + cascade |
| The user identifies group members | Planned | No groups table yet |
| The system emails group members for validation | Planned | Invite / accept email flow |
| The system creates or updates the group | Planned | New `groups` + `group_members` models |
| A user can remove themselves from a group | Planned | Leave-group action |

### Current model (beta)
- Each logged-in user sees **only their own** listings (per-user RLS).
- Groups / shared household views are **not** in this prototype yet.
- Matching email submissions uses the same email the user signed up with.

---

## 3. Review listings

| Step | Status | Notes |
|------|--------|--------|
| The user logs into the system | Done | `/login` magic link |
| List view of listings | Done | Dashboard with beds/baths/sqft + sort/filter |
| Map view of listings | Done | Carto light tiles; pin popup shows facts + directions |
| Select a listing to view details | Done | `/listings/[id]` detail page |
| Update the status of any listing | Planned | Need status UI (interested / visiting / offer / rejected, etc.) |
| Add comments to any listing | Done | Comments on detail page |
| Delete any listing | Planned | Need delete action in UI (RLS already allows delete) |
| Open device maps for driving directions | Done | Google Maps + Apple Maps links from map popup / detail |
| Sort and filter the list | Done | Search, min beds, max price, sort options |

### Current review flow
```
Login → Dashboard (list + sort/filter)
     → Listing detail (facts + comments + directions)
     → Map (pins, popup facts, Get directions)
```

---

## Scope for this prototype vs next version

### Prototype goals (now)
- Shared non-personal submission inbox
- Record who submitted each listing
- Private per-user list + map
- Manual URL submit + optional email ingest
- Listing facts on cards/map, comments, directions, sort/filter
- Gather feedback from known testers

### Next version (after feedback)
- Groups / household sharing
- Invite + validation emails
- Status updates
- Delete listing + close account
- Stronger AI parsing by default (URL alone always fills beds/baths/sqft)

---

## Suggested test path for beta testers

1. Create account with the email you will send listings from  
2. Add a listing via **Add** (URL; address optional if AI is on)  
3. Confirm beds/baths/sqft on **Dashboard** cards  
4. Open **Map** → tap pin → **Get directions**  
5. Open listing detail → add a **comment**  
6. Try **sort/filter** on the dashboard  
7. Share feedback: groups, status, AI quality  

---

## Related files

| Area | Location |
|------|----------|
| Schema | `supabase/schema.sql` |
| Comments migration | `supabase/migrations/002_comments.sql` |
| Email ingest API | `src/app/api/ingest/route.ts` |
| Web submit API | `src/app/api/listings/route.ts` |
| Comments API | `src/app/api/listings/[id]/comments/route.ts` |
| Gmail Apps Script | `scripts/gmail-ingest.gs` |
| Dashboard / Map / Submit / Detail | `src/app/(app)/` |
