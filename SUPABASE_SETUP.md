# Connect ONCOSMART to Supabase

## 1. Create project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Wait until the project is ready

## 2. Get API keys

1. **Project Settings** (gear) → **API**
2. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 3. Add keys to the app

1. Copy `.env.example` to `.env` in the project root
2. Paste your URL and anon key
3. Restart the app:

```powershell
cd c:\Users\sudar\cancer-fitness-app
npm.cmd start -- --clear
```

## 4. Create video storage bucket

1. Supabase → **Storage** → **New bucket**
2. Name: `exercise-videos`
3. Enable **Public bucket**
4. Upload folders:

```
day-01/male-en.mp4
day-01/male-ta.mp4
day-01/female-en.mp4
day-01/female-ta.mp4
day-02/...
```

## 5. Link videos in the app

Open `data/levels.json`. You can use **short storage paths** (recommended):

```json
"male-en": "day-01/male-en.mp4"
```

Or full public URLs:

```json
"male-en": "https://xxxxx.supabase.co/storage/v1/object/public/exercise-videos/day-01/male-en.mp4"
```

The app builds Supabase URLs automatically when `.env` is set and paths are used.

## 6. Test connection

After `.env` is set, open the app. Videos on Home should load from Supabase instead of Google Drive.

## 7. Progress sync (later)

Run `supabase/schema.sql` in **SQL Editor** when you add patient login and cloud progress tracking.
