# ONCOSMART — Project Status (June 2026)

Current snapshot of what is built, how to run it, known issues, and what is still pending.

**Project path:** `c:\Users\sudar\cancer-fitness-app`

**Figma:** [ONCOSMART Figma](https://www.figma.com/design/FuAJVyrAPY2iDwVy20Hk7s/ONCOSMART)

---

## What this app is

ONCOSMART is a cancer-patient fitness app (Sri Ramachandra Faculty of Physiotherapy). Patients complete guided exercise sessions with portrait videos, rest timers, pain tracking, and progress through levels.

| Decision | Choice |
|----------|--------|
| Platform | Android APK (direct share; Play Store later) |
| Design | Figma — match screens closely |
| Languages | Tamil + English (separate video files per language) |
| Profiles | Male / Female video tracks; shared progress |
| Progress | Local on device (Zustand + AsyncStorage) |
| Video hosting | Supabase Storage (stream URLs; not bundled in APK) |

---

## Tech stack (current)

| Piece | Technology |
|-------|------------|
| Framework | Expo SDK **54** + React Native 0.81 + React 19 + TypeScript |
| Navigation | Expo Router (`app/` folder) |
| i18n | i18next — `locales/en.json`, `locales/ta.json` |
| State | Zustand + AsyncStorage persist |
| Video (native) | expo-video (`SessionVideoPlayer.tsx`) |
| Video (web preview) | HTML5 `<video>` (`SessionVideoPlayer.web.tsx`) |
| Images | expo-image |
| Backend / storage | Supabase (`@supabase/supabase-js`) |
| Fonts | Roboto + Antonio via `@expo-google-fonts` |

**Node on this machine:** v26.3.0 (can cause Expo issues; Node 20 LTS is safer if builds fail)

---

## Screens and routes

### Onboarding

| Screen | Route | File |
|--------|-------|------|
| Splash | `/` | `app/index.tsx` |
| Language | `/onboarding` | `app/onboarding/index.tsx` |
| Username | `/onboarding/username` | `app/onboarding/username.tsx` |
| Age | `/onboarding/age` | `app/onboarding/age.tsx` |
| Gender | `/onboarding/gender` | `app/onboarding/gender.tsx` |
| Avatar | `/onboarding/avatar` | `app/onboarding/avatar.tsx` |
| PAR-Q Part 1 | `/onboarding/parq` | `app/onboarding/parq/index.tsx` |
| PAR-Q Part 2 | `/onboarding/parq/part2` | `app/onboarding/parq/part2.tsx` |
| PAR-Q Result | `/onboarding/parq/result` | `app/onboarding/parq/result.tsx` |

**Onboarding flow:**

```
Splash (3s or tap) → Language → Username → Age → Gender → Avatar → PAR-Q (2 parts) → Result → Home
```

**Preview shortcut (skip onboarding):**

```
http://localhost:PORT/onboarding/parq/result?preview=cleared
```

### Main app

| Screen | Route | File |
|--------|-------|------|
| Home | `/home` | `app/home.tsx` |
| Your Growth | `/growth` | `app/growth.tsx` |
| Settings | `/settings` | `app/settings.tsx` |
| Day session list | `/exercise/sessions/[day]` | `app/exercise/sessions/[day].tsx` |
| Exercise player / session | `/exercise/[day]` | `app/exercise/[day].tsx` |
| Pain score (modal) | `/exercise/pain-score` | `app/exercise/pain-score.tsx` |

---

## Day 1 exercise session (implemented)

### User flow

1. Home → Welcome Day 1 card → **Start Session**
2. Pulse oximeter modal (optional skip)
3. Exercise player — portrait video, sound on, pause / resume / restart
4. **Rest timer (20 seconds)** — only after video fully completes
5. Next exercise → repeat until all 12 done
6. `setLevelsCompleted(1)` → navigate to `/growth`

### Session exercises (12 total)

Defined in `data/day1-session.json`:

| # | ID | Reps / duration | Portrait video file |
|---|-----|-----------------|---------------------|
| 1 | diaphragmatic-breathing | 10 REPS | Diaphragmatic Breathing Male English.mp4 |
| 2 | ankle-pumps | 20 REPS | Ankle Pumps Male English.mp4 |
| 3 | thoracic-expansion | 10 REPS | Thoracic Expansion Male English.mp4 |
| 4 | arm-circles | 10 REPS | Arm Circles Male English.mp4 |
| 5 | spot-marching | 02 MINS | Spot Marching Male English.mp4 |
| 6 | calf-raise | 10 REPS | Calf raise Male English.mp4 |
| 7 | sit-to-stand | 10 REPS | Sit to stand Male English.mp4 |
| 8 | biceps-curls | 10 REPS | Biceps curls Male English.mp4 |
| 9 | wall-pushup | 10 REPS | Wall Pushup Male English.mp4 |
| 10 | shoulder-shrugging | 10 REPS | Shoulder shrugs Male English.mp4 |
| 11 | straight-leg-raise-left | 10 REPS | SLR Left Male English.mp4 |
| 12 | straight-leg-raise-right | 10 REPS | SLR Right Male English.mp4 |

### Session behavior (fixes applied)

- Rest timer fires **only after video end** (~90% watched + started), including through pause/resume
- Pause stops progress counting; resume continues; restart resets video and completion state
- Sound: unmuted, volume 1
- Back button shows **“Why did you stop?”** modal
- Session orchestration uses in-screen state (`phase`, `exerciseIndex`) in `app/exercise/[day].tsx`, not router hops for rest/exercise transitions

### Key session files

| Area | Files |
|------|-------|
| Session orchestrator | `app/exercise/[day].tsx` |
| Session start | `app/exercise/sessions/[day].tsx` |
| Player UI | `components/exercise/ExercisePlayerView.tsx` |
| Video (native) | `components/exercise/SessionVideoPlayer.tsx` |
| Video (web) | `components/exercise/SessionVideoPlayer.web.tsx` |
| Completion guard | `components/exercise/sessionVideoCompletion.ts` |
| Rest timer | `components/exercise/RestTimerScreen.tsx` |
| Back popup | `components/exercise/WhyDidYouStopModal.tsx` |
| Pulse oximeter | `components/exercise/PulseOximeterModal.tsx` |
| Portrait URLs | `lib/getPortraitVideoUrl.ts` |
| Session data loader | `lib/getDay1Session.ts` |
| Exercise metadata | `data/day-exercises.json` |

### Direct preview URL (Day 1 session)

```
http://localhost:PORT/exercise/1?session=1&index=0&started=1
```

---

## Growth / progress screen

Implemented in `app/growth.tsx` with components:

- `components/growth/GrowthTabSwitch.tsx` — Progress / Workouts tabs
- `components/growth/StreakCard.tsx`
- `components/growth/LevelsCard.tsx`
- `components/growth/BadgesSection.tsx`
- `components/growth/PainProgressCard.tsx`
- `components/growth/WorkoutsSection.tsx` + `WorkoutRowCard.tsx`
- `components/growth/LevelTabSwitch.tsx`

Supporting libs: `lib/getEarnedBadges.ts`, `lib/getDisplayPainScore.ts`, `lib/getLevelWorkouts.ts`, `lib/getWorkoutPhotoUrl.ts`, `lib/resolveWorkoutPhoto.ts`

---

## Settings screen

Implemented in `app/settings.tsx` with `components/settings/SettingsRow.tsx`.

---

## State (`store/useAppStore.ts`)

Persisted locally via AsyncStorage:

| Field | Purpose |
|-------|---------|
| `language` | `en` or `ta` |
| `username` | Display name |
| `ageRange` | Age bracket |
| `gender` | male / female / prefer_not_to_say |
| `avatar` | male / female |
| `parqAnswers` | 7 PAR-Q answers |
| `parqCleared` | PAR-Q pass/fail |
| `painScores` | Per-day pain scores |
| `progressPaused` | Pause progress tracking |
| `levelsCompleted` | Number of levels finished |

---

## Supabase integration

### Config

- `.env` from `.env.example` — `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_SUPABASE_VIDEO_BUCKET`
- Client: `lib/supabase.ts`, `lib/env.ts`
- URL builders: `lib/supabaseStorage.ts`, `lib/resolveVideoUrl.ts`, `lib/getPortraitVideoUrl.ts`

### Video bucket

**Base URL pattern:**

```
https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets
```

**Portrait folder:** `Male Potrait English videos/` (user spelling “Potrait”)

**Landscape preview folder:** `Male and Female png exports/` (short ~6–15s clips for some exercises)

### Upload status (portrait English, male)

| Status | Videos |
|--------|--------|
| On Supabase | Shoulder shrugs, Biceps curls, Wall Pushup, SLR Left, SLR Right |
| **Not uploaded yet** | Calf raise, Sit to stand, and most first-batch warm-up portrait videos |

Missing videos show **“Video not available”** until uploaded.

See also: `SUPABASE_SETUP.md`, `data/HOW_TO_ADD_VIDEO.md`

---

## Components (summary)

### Shared UI

- `SplashFooter`, `LanguageCard`, `PrimaryButton`, `SelectOption`, `ScreenHeader`
- `YesNoToggle`, `ParqQuestion`, `ParqCheckmarkIllustration`
- `BottomTabBar`, `AvatarCard`, `ExerciseVideoBanner`
- `components/home/ProgressLogo.tsx`
- `components/pain/PainScorePanel.tsx`, `ReadyToBeginModal.tsx`

### Exercise session

- `ExerciseSessionCard`, `ExercisePlayerView`, `SessionVideoPlayer` (+ `.web`)
- `RestTimerScreen`, `WhyDidYouStopModal`, `PulseOximeterModal`
- `day1Thumbnails.ts`

### Growth

- See Growth section above

---

## Data files

| File | Purpose |
|------|---------|
| `data/day1-session.json` | Day 1 session queue (12 exercises) |
| `data/day-exercises.json` | Exercise metadata, thumbnails, stretch entries |
| `data/levels.json` | Level / day video URL mapping |
| `data/workout-photos.json` | Workout tab photo filenames |

---

## How to run (Windows)

### Start dev server (web)

```powershell
cd c:\Users\sudar\cancer-fitness-app
$env:NODE_OPTIONS="--no-experimental-strip-types"
npm.cmd start -- --web --port 8082 --clear
```

Use `npm.cmd` (not `npm`) — PowerShell may block `npm.ps1`.

Wait until terminal shows: `Waiting on http://localhost:8082`

### Health check

```powershell
Invoke-WebRequest http://localhost:8082/status -UseBasicParsing
```

Should return `packager-status:running`.

### Useful preview URLs

| What | URL |
|------|-----|
| Skip onboarding | `http://localhost:8082/onboarding/parq/result?preview=cleared` |
| Home | `http://localhost:8082/home` |
| Day 1 session | `http://localhost:8082/exercise/1?session=1&index=0&started=1` |

Replace `8082` with whatever port the terminal shows.

### Phone testing (Expo Go)

- QR image: `expo-qr.png` (e.g. `exp://192.168.1.7:8081`)
- Phone and PC must be on same Wi‑Fi
- **Expo Go SDK must match project SDK (54)** — install matching build from [expo.dev/go](https://expo.dev/go)
- Mismatched SDK causes `java.lang.Incompatible SDK version` or blank screen on Android

### TypeScript check

```powershell
npx tsc --noEmit
```

---

## Known issues

### 1. `ERR_CONNECTION_REFUSED` in browser

**Cause:** Expo Metro dev server is not running (or wrong port).

**Fix:** Start server; match URL port to terminal (`8081` vs `8082`).

### 2. Black / blank screen in browser preview

**Cause:** Server is up but React app does not mount. Likely contributors:

- Root layout blocks render until fonts load (`app/_layout.tsx` returns `null` if `!fontsLoaded`)
- Font load failure leaves screen blank forever
- Cursor embedded browser may not execute JS reliably — try Chrome on `localhost`

**Workaround:** Use Chrome; wait 1–2 min for first bundle; try static export:

```powershell
npx expo export --platform web --output-dir .expo-web-test
npx serve .expo-web-test -l 8090
```

### 3. Expo Go SDK mismatch

Project is SDK 54. Store Expo Go may be a different SDK → incompatible errors on iPhone / Redmi.

**Options:** Install correct Expo Go from expo.dev/go, use phone browser at PC IP, or build EAS dev APK (not set up yet — no `eas.json`).

### 4. Node v26

Can break Expo plugins (e.g. `expo-image` was removed from `app.json` plugins). Prefer Node 20 LTS if problems persist.

### 5. Missing portrait videos

Several Day 1 warm-up videos not on Supabase yet — player shows unavailable state for those exercises.

---

## `app.json` plugins (current)

- `expo-router`
- `expo-font`
- `expo-splash-screen`
- `expo-localization`
- `expo-video`

**Not included:** `expo-image` (removed due to Node 26 plugin error)

---

## Not built yet / pending

- [ ] EAS Build / Android APK (`eas.json` not created)
- [ ] All 120 videos uploaded (30 exercises × 4 variants)
- [ ] Tamil portrait videos and Tamil font (Noto Sans Tamil)
- [ ] Female portrait video track
- [ ] Full level unlock logic (Level 1 → Level 2 next day)
- [ ] Language toggle in Settings (change anytime)
- [ ] Cloud progress sync (schema in `supabase/schema.sql` when login added)
- [ ] Stretch exercises in session queue (hamstring, quadriceps, etc. — in `day-exercises.json` but no videos)
- [ ] Reliable web preview in Cursor side panel
- [ ] Fix font-loading gate so web preview does not stay blank

---

## Folder structure (high level)

```
cancer-fitness-app/
  app/                    # Expo Router screens
  components/             # UI components
  data/                   # JSON session / level / exercise data
  lib/                    # Supabase, video URL resolvers, helpers
  locales/                # en.json, ta.json
  store/                  # Zustand app state
  theme/                  # colors, fonts
  assets/                 # Local images, splash, parq, exercise thumbs
  i18n/                   # i18next setup
  supabase/               # schema.sql
  PROJECT_STATUS.md       # This file
  NEW_CHAT_HANDOFF.md     # Older handoff (partially outdated)
  SUPABASE_SETUP.md
```

---

## For the next chat

Paste this into a new Cursor chat:

```
Continue building ONCOSMART. Read PROJECT_STATUS.md in c:\Users\sudar\cancer-fitness-app first.
Project path: c:\Users\sudar\cancer-fitness-app
Next task: [what you want]
```

---

## Notes for AI assistants

1. User is **non-technical** — explain simply, match Figma closely
2. **Do not** put video files in the git repo
3. Progress is **shared** when switching language or gender (same exercise `id`)
4. Primary button color when active: `#005A92` / `#005F99`
5. **Do not commit** unless the user explicitly asks
6. Portrait video folder spelling on Supabase: `Male Potrait English videos/`

---

*Last updated: June 15, 2026 — Day 1 session (12 exercises), growth/settings, Supabase wiring, web preview issues documented.*
