# Supabase pathway video inventory (2026-09-29)

Bucket: **`Oncosmart Videos and Assets`** (public)  
Project: `soyaeuffzytrjojifvdz`

## Summary

| Metric | Value |
|--------|------:|
| Total objects | 1,023 |
| MP4 files | 1,002 |
| Pathway MP4s (4 roots) | 1,000 |
| Home page MP4s | 2 |
| Legacy `Male Potrait Videos english CM` MP4s | **0** |

**You do not need to paste URLs.** Every pathway video can be resolved as:

`https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets/{object_path}`

where `object_path` is the full `storage.objects.name` (URL-encoded per segment).

## Folder layout (already matches male/female × cancer × level)

```
{Gender} - {Language}/
  {Cancer type folder}/
    Level {1-4} - ... /
      {order}.{Exercise description} {5Reps|10Reps|15Reps|1Min}.mp4
```

Roots:

- `Male - English` (250 mp4)
- `Female - English` (250)
- `Male - Tamil` (250)
- `Female - Tamil` (250)

Cancer types (4 each, all present for all 4 roots):

| Cancer | Typical files per level (L1 / L2 / L3 / L4) |
|--------|---------------------------------------------|
| Breast | 12 / 15 / 15 / 15 |
| Thorax | 12 / 20 / 20 / 20 |
| Abdomen | 16 / 21 / 21 / 21 |
| Head and Neck | 9 / 11 / 11 / 11 |

L3/L4 filenames include `10Reps` / `15Reps`; L1/L2 use `5Reps` or `1Min` (spot marching).

## Auto-mapping strategy (recommended)

1. Resolve root: `Male - English` from gender + avatar + language.
2. Resolve cancer folder via **alias table** (see naming issues below).
3. List objects under `Level {n} - …/` sorted by numeric prefix before the first `.`.
4. Each sorted file = **one guided session step** (order = your diagram sequence).
5. Parse rep label from filename (`5Reps`, `10Reps`, `15Reps`, `1Min`) for UI.
6. Derive stable `exerciseId` from filename keywords where possible; allow duplicate DBE at start/end as separate steps.

Optional: one-time script queries `storage.objects` and commits a JSON manifest for offline use (no runtime DB dependency).

## Naming issues to fix OR handle in code aliases

| Location | Issue | Suggestion |
|----------|--------|------------|
| `Female - English/` | Thorax folder named **`Thoraxic Cancer - Male - English`** (wrong gender in name) | Rename in Supabase **or** alias in code |
| `Female - Tamil/` | **`Breast Cancer  - Female - Tamil`** (double space) | Alias exact folder name |
| `Male - Tamil/` | **`Thorax Cancer - Male - Tamil`** vs English **`Thoraxic Cancer`** | Alias both spellings |
| Various | Left/right pairs (e.g. two `7.Wall Climb…`, two `8.Triceps…`) | Keep as two steps or merge in UI — product decision |

## App status (wired)

Guided sessions resolve from these pathway folders at runtime via `list_pathway_video_paths()` (+ bundled `data/pathway-videos.json` fallback).

- Onboarding / Settings: cancer type slug (`breast` | `thorax` | `abdomen` | `head-neck`)
- Root from gender/avatar + language
- Level folder → files sorted by numeric prefix
- Left/right same order number = **two consecutive steps**
- Changing cancer pathway in Settings resets progress (with confirm)

Validate: `npm run check:pathway`  
Refresh offline manifest: `npm run generate:pathway-manifest`

## Optional storage cleanup

1. Rename Female English thorax folder (`Thoraxic Cancer - Male - English` → Female).
2. Normalize double spaces / typo folder names (aliases already handle these in code).
