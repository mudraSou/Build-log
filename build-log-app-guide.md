# Build Log App — Prompt & Deployment Guide

---

## The Prompt

Copy this exactly when starting a new Claude Code session:

```
Build a "Build Log" shipping feed app with the following spec:

**Core Feature**
A single-page app where users submit what they've shipped. Posts appear as cards in a feed, newest first. No auth required — just name + what you built + optional link.

**UI/UX**
- Top: submission form with 3 fields: Name (text), What I built (textarea), Link (optional URL input)
- Submit button — disabled while posting, shows loading state
- Below: scrollable feed of cards showing: name, description, link (if present, clickable), and relative time (e.g. "2 hours ago")
- Mobile-first, clean minimal design — like a stripped-down Twitter/Linear hybrid
- Handle all states: loading feed, empty feed ("Be the first to ship something"), error, success toast on submit

**Tech Stack**
- Next.js 14 App Router with TypeScript
- Supabase for database (postgres) + realtime
- Tailwind CSS for styling
- Deploy-ready for Vercel

**Supabase**
- Single table: `posts` with columns: id (uuid), name (text), description (text), link (text nullable), created_at (timestamptz default now())
- Use Supabase Realtime so new posts appear instantly without refresh
- Use environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

**Requirements**
- Input validation: name and description required, link must be valid URL if provided
- Sanitize inputs before insert
- No console.logs in production code
- Rate limit awareness: keep it simple, no spam protection needed for MVP
- Include the SQL to create the table as a comment or in a /supabase/schema.sql file

Scaffold the full project. Show me every file I need.
```

---

## Step-by-Step Manual Instructions

### Step 1 — Create a Supabase Project
Go to supabase.com → New Project → choose a name and region.

**Why:** Supabase gives you a hosted Postgres database + auto-generated REST/realtime API. You don't manage any server.

**Benefit:** Free tier covers this project entirely. You get a database, API keys, and a dashboard to inspect your data — all in 2 minutes.

---

### Step 2 — Run the SQL Schema
In Supabase → SQL Editor → paste and run:

```sql
create table posts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  link text,
  created_at timestamptz default now()
);

alter table posts enable row level security;

create policy "Anyone can read posts" on posts for select using (true);
create policy "Anyone can insert posts" on posts for insert with check (true);
```

**Why:** Creates your table and sets Row Level Security (RLS) policies. Without RLS policies, Supabase blocks all requests by default even with the public anon key.

**Benefit:** Your data is readable/writable by the app but can't be deleted or modified by anonymous users — right security posture for a public feed.

---

### Step 3 — Get Your API Keys
Supabase → Project Settings → API → copy `Project URL` and `anon public` key.

**Why:** The app needs these to connect to your database. They go in environment variables, never hardcoded.

**Benefit:** You can rotate keys or move to a different project without touching code.

---

### Step 4 — Run the Claude Prompt
Open a new Claude Code session in an empty folder, paste the prompt above, and let it scaffold the full project.

**Why:** This generates all boilerplate — Next.js config, Tailwind setup, Supabase client, components, and API logic — in one shot.

**Benefit:** You skip ~2 hours of setup and get a working base to iterate from.

---

### Step 5 — Add Environment Variables Locally
Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Why:** The app reads these at runtime. `.env.local` is gitignored by default so keys never end up in version control.

**Benefit:** Keeps secrets out of your repo. Same pattern works locally and in production.

---

### Step 6 — Test Locally
```bash
npm install
npm run dev
```
Open localhost:3000, submit a post, verify it appears.

**Why:** Catch any issues before deploying. Much faster to debug locally than in production.

**Benefit:** You know it works before anyone else sees it.

---

### Step 7 — Push to GitHub
```bash
git init
git add .
git commit -m "initial build log app"
gh repo create build-log --public --push
```

**Why:** Vercel deploys directly from GitHub. Every push to main triggers a new deploy automatically.

**Benefit:** Continuous deployment for free — you edit a file, push, and it's live in ~60 seconds.

---

### Step 8 — Deploy on Vercel
Go to vercel.com → New Project → Import your GitHub repo → in the Environment Variables section add your two Supabase keys → Deploy.

**Why:** Vercel is the native host for Next.js — built by the same team. Zero config needed.

**Benefit:** Global CDN, HTTPS, preview deployments on every PR, all free on the hobby tier.

---

### Step 9 — Enable Realtime in Supabase
Supabase → Database → Replication → enable realtime for the `posts` table.

**Why:** The app subscribes to live changes. Without this toggle, the channel exists but no events fire.

**Benefit:** New posts from anyone appear on all open screens instantly — no refresh needed, feels alive.

---

## What You End Up With

| Capability | How |
|---|---|
| Public feed, no login | Supabase anon key + open RLS policies |
| Instant updates | Supabase Realtime channel |
| Global deployment | Vercel edge network |
| Zero infra to manage | Supabase + Vercel both fully managed |
| Free to run | Both have generous free tiers for this scale |
