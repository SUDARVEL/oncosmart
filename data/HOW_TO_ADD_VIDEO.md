# How to add your Day 1 exercise video

The app does **not** store video files inside the project folder.  
You upload the video online and paste a **link (URL)** into `data/levels.json`.

---

## Quick start (one video for testing)

1. Upload your `.mp4` file to **Supabase Storage** (see steps below), or use any public video link.
2. Open `data/levels.json` in Cursor.
3. Paste your link into **male-en** (one slot is enough for testing):

```json
"male-en": "https://YOUR-PROJECT.supabase.co/storage/v1/object/public/exercise-videos/day1-male-en.mp4"
```

4. Save the file.
5. Restart the app: `npm.cmd start -- --clear`
6. Open **http://localhost:8081/home** — the Day 1 card should show your video.
7. Tap **Start** for full-screen playback with controls.

---

## Four video versions (final app)

Each exercise has 4 videos:

| Key in levels.json | Who sees it |
|--------------------|-------------|
| male-en | Male avatar + English |
| male-ta | Male avatar + Tamil |
| female-en | Female avatar + English |
| female-ta | Female avatar + Tamil |

Fill all four URLs when you have all versions uploaded.

---

## Upload to Supabase (recommended)

1. Go to [supabase.com](https://supabase.com) and open your project.
2. Click **Storage** in the left menu.
3. Create a bucket named `exercise-videos` (set it **Public** for now).
4. Click the bucket → **Upload file** → choose your Day 1 `.mp4`.
5. After upload, click the file → **Copy URL** (public URL).
6. Paste that URL into `data/levels.json` under the correct key.

Example URL shape:

```
https://abcdefghij.supabase.co/storage/v1/object/public/exercise-videos/day1-male-en.mp4
```

---

## Preview

```powershell
cd c:\Users\sudar\cancer-fitness-app
npm.cmd start -- --clear
```

| What | URL |
|------|-----|
| Home (video preview in card) | http://localhost:8081/home |
| Full player (tap Start) | http://localhost:8081/exercise/1 |

On phone: scan the Expo QR code from the terminal (same Wi‑Fi as your PC).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Still shows static image | URL empty or wrong — check `data/levels.json` and restart with `--clear` |
| Video won't play | URL must be **https** and publicly accessible |
| Wrong video language | Fill the correct key (male-en, male-ta, etc.) |
| "Video not added yet" on Start | Same as above — add URL and restart |
