# UX Portfolio

Next.js + Supabase + React Three Fiber portfolio shell.

## Stack

- **Next.js** (App Router) — site
- **Supabase** — profile, projects, case study sections, contact messages, media
- **GitHub → Vercel** — host (set Root Directory to `portfolio`)
- **R3F / Drei** — 3D (Home + Gallery; added when you define those sections)

## Local

```bash
cd portfolio
cp .env.example .env.local
npm install
npm run dev
```

## Supabase setup (when ready)

1. Create a **new** Supabase project
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor
3. Create public Storage bucket `portfolio-media`
4. Put URL + anon key in `.env.local`

## Building sections

Sections are empty on purpose. Define each one (start with **Hero**), then we implement it.

Home slots: `hero` → `selected-work` → `about` → `cta`

Inspiration board (Wall of Portfolios interactive category + live examples):
[`docs/INSPIRATION.md`](docs/INSPIRATION.md)
