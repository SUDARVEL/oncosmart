# ONCOSMART — New Chat Handoff

Copy this file (or `@NEW_CHAT_HANDOFF.md`) into a **new Cursor chat** to continue building without losing context.

---

## Project summary

**ONCOSMART** is a cancer-patient fitness app (Sri Ramachandra Faculty of Physiotherapy). Patients watch guided exercise videos, do exercises on their own, and track progress through levels.

| Decision | Choice |
|----------|--------|
| Platform | **Android APK** (direct share, no Play Store for now) |
| Design source | **Figma** — match screens pixel-close |
| Languages | **Tamil + English** (toggle; separate video files per language) |
| User profiles | **Male / Female** (separate video tracks; shared progress) |
| Progress storage | **Local on device** (no login for MVP) |
| Video hosting | **Supabase Storage** (stream URLs; not bundled in APK) |
| Video backup | Google Drive (free backup only) |

**Figma file:** [ONCOSMART Figma](https://www.figma.com/design/FuAJVyrAPY2iDwVy20Hk7s/ONCOSMART)

**Project path:** `c:\Users\sudar\cancer-fitness-app`

---

## Tech stack

| Piece | Technology |
|-------|------------|
| Framework | Expo SDK 56 + React Native + TypeScript |
| Navigation | Expo Router (`app/` folder) |
| i18n | i18next + `locales/en.json`, `locales/ta.json` |
| State | Zustand + AsyncStorage persist |
| Video (planned) | expo-video + Supabase URLs |
| Design → code | Figma Desktop + Cursor MCP (`get_design_context`) |
| Final build | EAS Build → APK file |

---

## What is already built

### Screens (done)

| Screen | Route | File |
|--------|-------|------|
| Splash | `/` | `app/index.tsx` |
| Language | `/onboarding` | `app/onboarding/index.tsx` |
| Username | `/onboarding/username` | `app/onboarding/username.tsx` |
| Age | `/onboarding/age` | `app/onboarding/age.tsx` |
| Gender | `/onboarding/gender` | `app/onboarding/gender.tsx` |
| PAR-Q Part 1 | `/onboarding/parq` | `app/onboarding/parq/index.tsx` |
| PAR-Q Part 2 | `/onboarding/parq/part2` | `app/onboarding/parq/part2.tsx` |
| PAR-Q Result | `/onboarding/parq/result` | `app/onboarding/parq/result.tsx` |
| Home | `/home` | `app/home.tsx` |
| Your Growth (placeholder) | `/growth` | `app/growth.tsx` |
| Settings (placeholder) | `/settings` | `app/settings.tsx` |

### Flow

```
Splash (3s or tap) → Language → Username → Age → Gender → PAR-Q (2 parts) → Result → Home
```

### Reusable components

- `components/SplashFooter.tsx`
- `components/LanguageCard.tsx`
- `components/PrimaryButton.tsx`
- `components/SelectOption.tsx`
- `components/ScreenHeader.tsx` (back arrow + title)
- `components/YesNoToggle.tsx` (PAR-Q Yes/No buttons)
- `components/ParqQuestion.tsx` (PAR-Q question block)
- `components/BottomTabBar.tsx` (Home / Growth / Settings)

### Assets (user-provided logos)

- `assets/splash/oncosmart-logo.png` — ribbon + runner + ONCOSMART text
- `assets/splash/college-footer.png` — Sri Ramachandra footer banner

### Store (`store/useAppStore.ts`)

Persisted fields: `language`, `username`, `ageRange`, `gender`, `parqAnswers`, `parqCleared`

---

## What is NOT built yet

- [ ] Remaining Figma screens (levels, video player, full growth/progress, settings)
- [ ] Supabase video integration (`levels.json` with 4 URLs per exercise)
- [ ] Level unlock logic (Level 1 → Level 2 next day)
- [ ] Tamil font (Noto Sans Tamil) via expo-font
- [ ] Language toggle in Settings (change anytime)
- [ ] Final APK build (EAS Build)
- [ ] 120 exercise videos uploaded to Supabase

---

## Video content plan

- **30 exercises** × **4 variants** = **120 videos**
  - Male + English, Male + Tamil, Female + English, Female + Tamil
- **Supabase bucket:** `exercise-videos` (public for MVP)
- **App stores URLs only** in `data/levels.json` — not video files in repo
- **Example URL format:**
  ```
  https://YOUR-PROJECT.supabase.co/storage/v1/object/public/exercise-videos/exercise-01/male-en.mp4
  ```

---

## How to run (Windows)

### Start dev server

```powershell
cd c:\Users\sudar\cancer-fitness-app
npm.cmd start
```

> Use `npm.cmd` not `npm` — PowerShell may block `npm.ps1`.

### Preview on PC

| What | URL / file |
|------|------------|
| Phone mockup | Double-click `phone-mockup.html` |
| Language screen | http://localhost:8081/onboarding |
| Username | http://localhost:8081/onboarding/username |
| Age | http://localhost:8081/onboarding/age |
| Gender | http://localhost:8081/onboarding/gender |
| Expo QR page | Double-click `expo-connect.html` |

### Preview on Android phone

1. Install **Expo Go**
2. Same Wi‑Fi as PC
3. Scan QR from `expo-connect.html` or enter: `exp://YOUR_PC_IP:8081`

### Chrome mobile view

Open any localhost URL → **F12** → phone icon → **390 × 844**

---

## Figma screens already implemented

| Figma node | Screen |
|------------|--------|
| `632:1860` | Splash |
| `489:1550` / `613:1731` / `613:1639` | Language |
| `452:780` / `462:58` | Username (+ typing state) |
| `462:789` | Age |
| `489:1250` | Gender |
| `3198:6426` / `489:1905` | PAR-Q Part 1 & 2 |
| `501:1965` / `553:947` | PAR-Q Result (cleared / consult doctor) |
| `1146:26999` | Home Screen |

---

## Figma workflow for next screens

1. Open **Figma Desktop** (not browser only)
2. Select the **full screen frame**
3. Tell Cursor: *"Build this screen from Figma"*
4. Optional: add `c:\Users\sudar\cancer-fitness-app\assets` to **Figma Dev Mode → MCP → Allowed directories** for auto asset export

---

## Folder structure

```
cancer-fitness-app/
  app/
    index.tsx              # Splash
    home.tsx               # Placeholder home
    onboarding/
      index.tsx            # Language
      username.tsx
      age.tsx
      gender.tsx
      _layout.tsx
    _layout.tsx
  components/
  theme/colors.ts
  locales/en.json, ta.json
  store/useAppStore.ts
  i18n/index.ts
  assets/splash/
  phone-mockup.html        # PC phone frame preview
  expo-connect.html        # QR for Expo Go
```

---

## Prompt to paste in new chat

```
Continue building the ONCOSMART cancer fitness app.

Read @NEW_CHAT_HANDOFF.md in c:\Users\sudar\cancer-fitness-app first.

Project path: c:\Users\sudar\cancer-fitness-app

Next task: [describe what you want — e.g. "Build the Home screen from Figma" or "Add Supabase videos"]

Figma is open in Figma Desktop. Use npm.cmd start to run the app.
```

---

## Environment checklist

| Item | Status |
|------|--------|
| Node.js v26+ | Installed |
| npm.cmd works | Yes (use npm.cmd on Windows) |
| Expo Go on phone | User has it |
| Figma Desktop | User has it |
| Supabase account | User to set up / in progress |
| 120 videos in Supabase | Not all uploaded yet |

---

## Important notes for the AI

1. User is **non-technical** — explain simply, match Figma closely
2. **Do not** put video files inside the app repo
3. **APK only** — Android direct install, no Play Store required yet
4. Progress is **shared** when switching language or gender (same exercise `id`)
5. Splash auto-navigates to `/onboarding` after 3s; tap splash to skip early
6. Primary button color when active: `#005A92`

---

*Last updated: June 2026 — PAR-Q screening + Home screen complete; levels/video flow pending.*
