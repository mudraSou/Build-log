# Build Log App — Prompt & Deployment Guide

---

## The Prompt

Copy this exactly when starting a new Claude Code session:

```
Build a "Build Log" shipping feed app with the following spec:

**Core Feature**
A two-column layout app (40% left / 60% right) where users submit what they've shipped.
Posts appear as cards in a live feed, newest first. No auth required.

**Form fields (left panel)**
- Name (text, required)
- What you built (textarea, required, 280 char limit with live counter)
- Link (optional URL, validated)
- Submit button with loading spinner + success checkmark state

**Feed (right panel)**
- Header: "The Feed" + "What we are doing now" subtitle + ship count
- Cards showing: colored avatar (consistent per name), headline, description,
  link as clickable domain (e.g. github.com), relative time with full date on hover
- "NEW" badge on posts < 5 min old
- Realtime: new posts queue as a banner ("↑ N new ships — tap to reveal")
  instead of auto-inserting
- States: skeleton loading, empty with 🚀, error with retry button

**UI/UX**
- 40/60 two-column split layout, both panels independently scrollable
- Dark theme (zinc-950 base)
- Tagline: "Every great product started as a small ship. Drop yours. Someone's waiting to see it."
- Mobile: stacks vertically

**Microinteractions (left panel)**
- Panel slides in from left on load
- Logo icon scales + rotates 12° on hover with glow
- Live badge scales + brightens on hover
- Form fields stagger fade-up on load (60ms apart)
- Field labels brighten + nudge right on focus
- Left accent line appears beside focused field
- Inputs glow on focus
- Link field icon brightens when typing
- Character counter turns amber → red near limit
- Error fields shake on failed submit
- Submit button: shimmer sweep on hover, scale on click
- Submit → green "Shipped!" morphs with checkmark

**Microinteractions (right panel)**
- Cards lift + border brightens on hover
- Avatar scales + rotates on card hover
- Copy-link icon appears on card hover
- Link arrow nudges on hover
- New post banner bounces in

**Tech Stack**
- Next.js 16 App Router with TypeScript
- Supabase for database (postgres) + realtime
- Tailwind CSS for styling
- Deploy-ready for Vercel

**Supabase table: posts**
- id (uuid, pk), name (text), description (text),
  link (text nullable), created_at (timestamptz default now())
- RLS: select + insert open to anon
- Realtime enabled on posts table

**Requirements**
- Env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- Sanitize inputs before insert
- No console.logs
- Include SQL in /supabase/schema.sql

Scaffold the full project. Show me every file I need.
```

---

## Step-by-Step Manual Instructions

### Step 1 — Create a Supabase Project
Go to supabase.com → New Project → choose a name and region.

**Why:** Supabase gives you a hosted Postgres database + auto-generated REST/realtime API. You don't manage any server.

**Benefit:** Free tier covers this project entirely. You get a database, API keys, and a dashboard — all in 2 minutes.

---

### Step 2 — Run the SQL Schema
In Supabase → SQL Editor → paste and run:

```sql
create table posts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  title text,
  description text not null,
  link text,
  created_at timestamptz default now()
);

alter table posts enable row level security;

create policy "Anyone can read posts" on posts for select using (true);
create policy "Anyone can insert posts" on posts for insert with check (true);
```

**Why:** Creates your table and RLS policies. Without RLS, Supabase blocks all requests by default even with the public anon key.

**Benefit:** Data is readable/writable by the app but can't be deleted or modified by anonymous users.

> If you already have a posts table without the `title` column, run:
> ```sql
> alter table posts add column if not exists title text;
> ```

---

### Step 3 — Enable Realtime
Supabase → Database → Replication → toggle on the `posts` table.

**Why:** The app subscribes to live INSERT events. Without this toggle, the realtime channel exists but no events fire.

**Benefit:** New posts from anyone appear instantly on all open screens — no refresh needed.

---

### Step 4 — Get Your API Keys
Supabase → Project Settings → API → copy `Project URL` and `anon public` key.

**Why:** The app needs these to connect to your database. They go in env vars, never hardcoded.

**Benefit:** You can rotate keys or move projects without touching code.

---

### Step 5 — Add Environment Variables Locally
Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Why:** `.env.local` is gitignored by default — keys never end up in version control.

**Benefit:** Same pattern works locally and in production.

---

### Step 6 — Test Locally
```bash
npm install
npm run dev
```
Open localhost:3000, submit a post, verify it appears in the feed.

**Why:** Catch issues before deploying. Faster to debug locally.

**Benefit:** You know it works before anyone else sees it.

---

### Step 7 — Push to GitHub
```bash
git init
git add .
git commit -m "ship build-log"
git remote add origin https://github.com/YOUR_USERNAME/build-log.git
git branch -M main
git push -u origin main
```

**Why:** Vercel deploys from GitHub. Every push to main triggers a new deploy automatically.

**Benefit:** Continuous deployment for free — push and it's live in ~60 seconds.

---

### Step 8 — Deploy on Vercel (via CLI)
```bash
npm install -g vercel
vercel login
vercel link --yes --project build-log
echo "YOUR_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "YOUR_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel --prod
```

**Why:** Vercel CLI lets you deploy and set env vars without touching the browser dashboard.

**Benefit:** Global CDN, HTTPS, all free on hobby tier. Builds in ~12s.

---

## File Structure

```
build-log/
├── app/
│   ├── globals.css         — Tailwind + custom animations (shake, shimmer, panel-in, fade-up)
│   ├── layout.tsx          — Root layout, dark bg, overflow hidden for split pane
│   └── page.tsx            — 40/60 two-column layout, brand header, left/right panels
├── components/
│   ├── Feed.tsx            — Right panel: realtime feed, pending banner, skeleton, empty state
│   ├── PostCard.tsx        — Card: colored avatar, title, description, domain link, copy button
│   └── SubmitForm.tsx      — Left panel form: 4 fields, validation, shake errors, shimmer button
├── lib/
│   ├── supabase.ts         — Supabase client, fetchPosts, insertPost (includes title)
│   └── time.ts             — Relative time helper (no deps)
├── types/
│   └── index.ts            — Post interface (id, name, title, description, link, created_at)
├── supabase/
│   ├── schema.sql          — Full table creation + RLS
│   └── add_title.sql       — Migration: adds title column to existing table
├── .env.local              — Your Supabase keys (gitignored)
├── .env.local.example      — Template for keys
└── .gitignore
```

---

## How Realtime Works

| Event | Behaviour |
|---|---|
| You submit a post | Appears **instantly** at the top with a green NEW badge — no click needed |
| Someone else posts | Queues silently — a "↑ N new ships" banner appears, you tap to reveal |
| Duplicate guard | If realtime also fires for your own post, it's detected and skipped (no double entry) |

This is handled via a browser `CustomEvent` (`post-submitted`) fired from SubmitForm after a successful insert. Feed listens for it and inserts directly, bypassing the pending queue. The Supabase realtime channel only handles other users' posts.

---

## What You End Up With

| Capability | How |
|---|---|
| Public feed, no login | Supabase anon key + open RLS policies |
| Instant updates | Supabase Realtime channel on posts table |
| Own post instant feedback | CustomEvent fires on submit → Feed inserts immediately |
| New post queue banner | Other users' posts queue in banner — user chooses when to reveal |
| Consistent avatar colors | Name hash → 12-color palette |
| 40/60 split layout | Left form sticky, right feed scrollable |
| Microinteractions | CSS keyframes + Tailwind transitions throughout |
| Global deployment | Vercel edge network, ~12s build |
| Zero infra to manage | Supabase + Vercel both fully managed |
| Free to run | Both have generous free tiers for this scale |

---

## Live URL

**https://build-log-xi.vercel.app**
