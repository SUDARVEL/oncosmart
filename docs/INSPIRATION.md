# Interactive portfolio inspiration

Source: [Wall of Portfolios — Interactive Design Portfolios](https://www.wallofportfolios.in/interactive-design-portfolios)

Use this board while defining each section. We will **not copy** layouts — we borrow patterns that fit hiring (case studies, resume, contact) + selective 3D.

## What “interactive” means on that page

Portfolios that use **animation / motion / interaction** to increase engagement — not 3D-only sites. Typical mix:

- Scroll-driven storytelling on Home
- Hover / cursor micro-interactions on project cards
- Motion accents (Lottie/Rive/GSAP/Framer Motion)
- Strong personal voice in hero
- Clear path into case studies

## Featured examples (from that category)

| Designer | Live site | Notes to steal (patterns only) |
|----------|-----------|--------------------------------|
| Nandini Chowdhary | https://nonuchow.framer.website/ | Framer motion, polished product narrative |
| Tee Hodgson | https://tee.works | Figma-caliber interaction craft |
| Aditya Sadhukhan | https://adityaaa.com | Hero identity → “tiny fraction of my work” grid → personal beyond-work → contact |
| Aarya Vaidya | https://www.aaryavaidya.in | Clean product-design storytelling |
| Shreyas Vyas | https://shreyasvyas.framer.website/ | Framer scroll / motion |
| Gokul R | https://gokuuxdesign.framer.website/ | UX case-study focused |
| Aanchal Dua | https://www.aanchaldua.in/ | Personal brand + work |
| Ayushi Korde | https://ayushikorde.in | Editorial case studies |
| Zainab Kabira | https://zainabkabira.com/ | Interactive product portfolio |
| (also popular) Yash Fataniya | https://yashf.in | Handcrafted interactions, taste showcase + case studies |

## Patterns we can map to our build

### Hero (define this first)
Common winning formula from these sites:
1. Name / brand as primary signal
2. One role line (e.g. “Product / UX designer…”)
3. One short proof or context line (company / focus)
4. Primary CTA → Work + secondary → Contact / Resume
5. Motion: cursor, floating visuals, or scroll hint — **not** blocking content

Our stack equivalent: Next.js section + Framer Motion + optional R3F accent.

### Selected work
- Large project cards with hover motion / preview
- Tags (role, year, product type)
- Click → deep case study (not a modal that hides process)

Our stack: Supabase `projects` → `/work` + `/work/[slug]`

### About / craft
- Personality without drowning the work
- Process / tools / taste — keep secondary to case studies

### Gallery (our 3D differentiator)
Most Wall-of-Portfolios “interactive” sites are **2D motion**, not spatial 3D. Our Gallery room is an optional wow layer **in addition** to the editorial path — keep Work grid as the hiring default.

### Resume + Contact
Always one click from nav; contact form → Supabase `messages`.

## How we’ll use this together

For each section you define, say:
1. Which inspiration site(s) feel closest
2. What to keep / skip
3. Your real copy + assets

Then we implement that section only in `/portfolio`.

## Decision still waiting on you

**Hero definition** — paste preferred vibe (1–2 links from above) + your name, headline, CTAs, and whether you want light motion, scroll 3D, or both.
