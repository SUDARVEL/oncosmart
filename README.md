# Portfolio

Standalone UX design portfolio — **separate** from the Oncosmart fitness app.

| Piece | Project |
|-------|---------|
| GitHub | New repo `SUDARVEL/Portfolio` (extract from `/portfolio` in oncosmart until that repo exists) |
| Supabase | New project named **portfolio** (not the fitness DB) |
| Host | Vercel → Root = repo root (or `portfolio` while still inside oncosmart) |

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase (profile, projects, case studies, contact, media)
- React Three Fiber / Drei (Home + Gallery 3D when defined)
- Framer Motion

## Local

```bash
cd portfolio   # or clone SUDARVEL/Portfolio when live
cp .env.example .env.local
npm install
npm run dev
```

## Supabase

1. Create project **portfolio** in your Supabase org (separate from Oncosmart fitness)
2. Run [`supabase/schema.sql`](supabase/schema.sql)
3. Create public Storage bucket `portfolio-media`
4. Set in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## GitHub (new repo)

This agent cannot create repos under your account. On GitHub:

1. **New repository** → name: `portfolio` → owner: `SUDARVEL`
2. Then either push this folder as the repo root, or tell the agent the repo URL after you create it

While waiting, code lives in the oncosmart monorepo at `/portfolio`.

## Sections

Empty on purpose. Define Hero first, then we implement section-by-section.

Inspiration: [`docs/INSPIRATION.md`](docs/INSPIRATION.md)
