# Supabase Bandwidth Audit — ONCOSMART

**Date:** July 2026  
**Issue:** Cached Egress exceeded 5 GB free tier (observed ~10.5 GB / 210%)

This document lists every bandwidth-related issue found, what was fixed, and rules for future development.

---

## 1. Supabase Storage API usage

| Operation | File | Before | After |
|-----------|------|--------|-------|
| `storage.list()` | `lib/supabase.ts` | Called on every dev app launch via `checkSupabaseConnection()` | Removed — returns `isSupabaseConfigured()` only (no network) |
| `getPublicUrl()` | `lib/supabaseStorage.ts` | Used SDK helper (no egress, but unnecessary) | Pure URL string builder via `getPublicStorageUrl()` |
| `upload()` | — | **Not used** | — |
| `download()` | — | **Not used** | — |
| `createSignedUrl()` | — | **Not used** | — |

**Why it mattered:** `list()` is a Storage API call. Public media URLs do not require SDK calls — only string concatenation.

---

## 2. Critical egress issues (fixed)

### Issue A — Session list autoplayed 15–26 MP4s at once

| | |
|---|---|
| **File** | `components/exercise/ExerciseSessionCard.tsx`, `app/exercise/sessions/[day].tsx` |
| **Before** | Each card mounted `ExerciseVideoBanner` with `autoPlay: true`, streaming portrait MP4s from Supabase |
| **Egress impact** | Opening “Welcome to Day X” could download **hundreds of MB** per visit |
| **Fix** | Cards now show **static `previewPhoto`** only (bundled PNG → cached remote PNG). Video plays only when user opens a single exercise or starts guided session |

### Issue B — Home screen looped Supabase placeholder MP4

| | |
|---|---|
| **File** | `app/home.tsx`, `lib/placeholderVideo.ts` |
| **Before** | `ExerciseVideoBanner` looped `Placeholder Text Video-1.mp4` from Supabase on every home visit |
| **Egress impact** | Continuous re-download on refresh / long sessions |
| **Fix** | Bundled static image `HOME_CARD_PLACEHOLDER_IMAGE` (`lib/homePlaceholder.ts`) |

### Issue C — Placeholder MP4 fallback on session cards

| | |
|---|---|
| **File** | `lib/getDayExercises.ts` |
| **Before** | `previewFallbackVideo: PLACEHOLDER_PREVIEW_VIDEO` when no thumbnail |
| **Egress impact** | Extra MP4 per card without local thumbnail |
| **Fix** | Removed; `previewPhoto` from `resolveWorkoutPhotoSource()` (local → Supabase PNG) |

---

## 3. Acceptable video usage (unchanged — by design)

| Screen | Behavior | Egress |
|--------|----------|--------|
| Guided session (`app/exercise/[day].tsx`) | One video at a time via `SessionVideoPlayer` | **Expected** — core feature |
| Single exercise preview (`?exercise=id`) | One video on demand | **Expected** |
| Growth workout detail slider | Static images only | Low (PNG, cached) |

---

## 4. Image loading optimizations (fixed)

| File | Change |
|------|--------|
| `components/CachedMediaImage.tsx` | New wrapper — `cachePolicy="memory-disk"` on all remote images |
| `components/exercise/ExerciseSessionCard.tsx` | Uses `CachedMediaImage` + `recyclingKey` |
| `components/growth/WorkoutRowCard.tsx` | Uses `CachedMediaImage` |
| `components/growth/WorkoutDetailSlide.tsx` | Uses `CachedMediaImage` |
| `app/home.tsx` | Bundled image, no remote fetch |

**Photo resolution order** (`lib/resolveWorkoutPhoto.ts`):

1. Bundled `assets/workouts/*.png` (zero egress)
2. Bundled Day 1 Figma thumbnails (zero egress)
3. Supabase PNG URLs (small vs MP4, disk-cached after first load)

---

## 5. Caching & memoization (fixed)

| File | What |
|------|------|
| `lib/resolveVideoUrl.ts` | Memoized URL resolution |
| `lib/getWorkoutPhotoUrl.ts` | Memoized photo URLs |
| `lib/getPortraitVideoUrl.ts` | Memoized portrait video URLs |
| `lib/getDayExercises.ts` | In-memory cache per `level|language|gender|avatar` |
| `app/exercise/sessions/[day].tsx` | `useMemo` for exercise list |

---

## 6. Re-render / duplicate request review

| Location | Finding | Action |
|----------|---------|--------|
| `app/_layout.tsx` | `checkSupabaseConnection` once on mount | Now no-op network |
| `app/exercise/sessions/[day].tsx` | `getDayExercises` on every render | **Fixed** with `useMemo` |
| `components/growth/WorkoutsSection.tsx` | Already uses `useMemo` for `workoutDetails` | OK |
| `app/exercise/[day].tsx` | Video sources in `useMemo` | OK |
| Auth (`lib/supabase.ts`) | Client singleton, no storage downloads on auth | OK |

No infinite `useEffect` loops affecting media were found.

---

## 7. Storage inventory (manual — Supabase dashboard)

Large assets likely driving egress:

| Asset type | Location | Recommendation |
|------------|----------|----------------|
| Portrait MP4s (26 files) | `Male Potrait Videos english CM/` | Keep for guided session; **never** autoplay on lists |
| Placeholder MP4 | `Placeholder Text Video-1.mp4` | **Stop using** on home/lists (done in code) |
| Male/Female PNGs | `Male and Female png exports/` | Prefer bundling more into `assets/workouts/` |
| Storage usage | 0.5 / 1 GB | OK — not the main problem |

**Unused uploads:** Audit bucket in Supabase dashboard for duplicate or test files.

---

## 8. Project rules (enforced going forward)

1. **Never autoplay Supabase video** on list/grid screens.
2. **Prefer bundled images** for previews; MP4 only during active playback.
3. **Use `CachedMediaImage`** for any `{ uri: supabaseUrl }` image.
4. **Memoize** exercise/media URL lists (`useMemo` + module cache).
5. **No `storage.list()`** in production paths.
6. **Warn before adding** autoplay video, looping banners, or full-quality MP4 previews.

---

## 9. Expected egress reduction

| Change | Estimated savings |
|--------|-------------------|
| Session list: 26 MP4s → PNGs | **~90%+** on that screen |
| Home: looped MP4 → bundled PNG | **~100%** on home preview |
| Image disk cache | **~70–90%** on repeat Growth visits |
| Remove `storage.list()` | Minor API quota |

Videos during **guided sessions** still count toward egress — that is expected for the product.

---

## 10. If egress is still high

1. Compress MP4s (720p, lower bitrate) in Supabase bucket  
2. Bundle more workout PNGs into `assets/workouts/`  
3. Move videos to Bunny.net / Cloudflare R2 + CDN  
4. Upgrade Supabase plan  

---

## Files changed in this refactor

- `lib/urlCache.ts` (new)
- `lib/homePlaceholder.ts` (new)
- `components/CachedMediaImage.tsx` (new)
- `lib/placeholderVideo.ts`
- `lib/supabase.ts`
- `lib/supabaseStorage.ts`
- `lib/resolveVideoUrl.ts`
- `lib/getWorkoutPhotoUrl.ts`
- `lib/getPortraitVideoUrl.ts`
- `lib/getDayExercises.ts`
- `components/exercise/ExerciseSessionCard.tsx`
- `app/exercise/sessions/[day].tsx`
- `app/home.tsx`
- `components/growth/WorkoutRowCard.tsx`
- `components/growth/WorkoutDetailSlide.tsx`
