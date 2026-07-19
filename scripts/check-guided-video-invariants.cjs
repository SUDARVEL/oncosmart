/**
 * Regression guard for guided exercise video playback.
 * Run: npm run check:videos
 *
 * Prevents these past production bugs from returning:
 * 1. Wrong Supabase bucket (`exercise-videos`) → "Video not available"
 * 2. Short landscape fallbacks → videos end in a few seconds
 * 3. `cover` fit → body/feet/hands cropped vs Figma
 * 4. Early completion from fake end events
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let failed = 0;

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  } else {
    console.log(`OK:   ${message}`);
  }
}

const frame = read('lib/exerciseVideoFrame.ts');
assert(
  /EXERCISE_VIDEO_SOURCE_HEIGHT\s*=\s*578/.test(frame),
  'Figma source composition height must stay 578',
);
assert(
  /EXERCISE_VIDEO_FRAME_WIDTH\s*=\s*349/.test(frame),
  'Frame width must stay 349',
);
assert(
  /EXERCISE_VIDEO_FRAME_HEIGHT\s*=\s*444/.test(frame),
  'Visible crop height must stay 444',
);
assert(
  /EXERCISE_VIDEO_FRAME_BORDER_RADIUS\s*=\s*16/.test(frame),
  'Frame radius must stay 16',
);
assert(
  /EXERCISE_VIDEO_OBJECT_POSITION\s*=\s*'center bottom'/.test(frame),
  'Crop must be bottom-anchored like Figma',
);

const policy = read('lib/videoStoragePolicy.ts');
assert(
  policy.includes("CANONICAL_VIDEO_BUCKET = 'Oncosmart Videos and Assets'"),
  'Canonical bucket must be Oncosmart Videos and Assets',
);
assert(
  policy.includes('exercise-videos'),
  'Legacy exercise-videos bucket must be remapped',
);

const envSrc = read('lib/env.ts');
assert(
  envSrc.includes('normalizeVideoBucket'),
  'env.ts must normalize/remap the video bucket',
);
assert(
  !/=\s*'exercise-videos'/.test(envSrc),
  'env.ts must not default to exercise-videos',
);

const media = read('lib/exerciseMediaUrls.ts');
assert(
  media.includes('Oncosmart%20Videos%20and%20Assets'),
  'exerciseMediaUrls must hardcode the correct public bucket',
);
assert(
  /resolveExercisePlaybackSources[\s\S]*return portrait \? \[portrait\] : \[\]/.test(media),
  'Guided playback sources must be portrait-only (no landscape fallback)',
);
assert(
  media.includes('getMaleTamilPortraitVideoPath') &&
    media.includes('getFemaleTamilPortraitVideoPath'),
  'Portrait resolution must support male/female Tamil maps',
);
assert(
  media.includes("language === 'ta'"),
  'Portrait resolution must switch on Tamil language',
);

const day = read('app/exercise/[day].tsx');
assert(
  day.includes('isValidGuidedPlaybackUrl'),
  'Guided session must validate playback URLs',
);
assert(
  day.includes('resolveExerciseGuidedPortraitUrl'),
  'Guided session must resolve portrait URLs',
);

const nativePlayer = read('components/exercise/SessionVideoPlayer.tsx');
assert(
  nativePlayer.includes('EXERCISE_VIDEO_SOURCE_ASPECT'),
  'Native player must use Figma source aspect crop box',
);
assert(
  nativePlayer.includes('sourceBox'),
  'Native player must bottom-align the tall source inside the crop window',
);

const webPlayer = read('components/exercise/SessionVideoPlayer.web.tsx');
assert(
  webPlayer.includes('EXERCISE_VIDEO_SOURCE_ASPECT'),
  'Web player must use Figma source aspect crop box',
);
assert(
  webPlayer.includes('EXERCISE_VIDEO_OBJECT_POSITION'),
  'Web player must bottom-anchor object position',
);
assert(
  webPlayer.includes('sourceBox'),
  'Web player must bottom-align the tall source inside the crop window',
);

const completion = read('components/exercise/sessionVideoCompletion.ts');
assert(
  completion.includes('MIN_COMPLETION_RATIO'),
  'Completion guard must require near-full watch ratio',
);
assert(
  completion.includes('shouldAcceptVideoEnd'),
  'Completion helper must export shouldAcceptVideoEnd',
);

function shouldAcceptVideoEnd(currentTime, duration, hasStarted) {
  const MIN_PLAYED_SECONDS = 1;
  const MIN_COMPLETION_RATIO = 0.9;
  if (!hasStarted) return false;
  if (!Number.isFinite(currentTime) || currentTime < MIN_PLAYED_SECONDS) return false;
  if (!Number.isFinite(duration) || duration <= 0) return false;
  const ratio = currentTime / duration;
  const nearEnd = duration - currentTime <= 1.25;
  return ratio >= MIN_COMPLETION_RATIO && nearEnd;
}

assert(
  shouldAcceptVideoEnd(0.4, 56, true) === false,
  'Must reject early end at 0.4s of a 56s video',
);
assert(
  shouldAcceptVideoEnd(56, 56, false) === false,
  'Must reject end before playback has started',
);
assert(
  shouldAcceptVideoEnd(55.2, 56, true) === true,
  'Must accept real near-end completion',
);

function sanitizePublicVideoUrl(url) {
  return url
    .replace(
      /\/storage\/v1\/object\/public\/exercise-videos\//gi,
      '/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets/',
    )
    .replace(
      /\/storage\/v1\/object\/public\/exercise_videos\//gi,
      '/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets/',
    );
}

function isLandscapePreviewVideoUrl(url) {
  try {
    return /Landscape/i.test(decodeURIComponent(url));
  } catch {
    return /Landscape/i.test(url);
  }
}

const bad =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/exercise-videos/Male%20Potrait%20Videos%20english%20CM/Male%20Dbe%20English-11.mp4';
const fixed = sanitizePublicVideoUrl(bad);
assert(
  fixed.includes('Oncosmart%20Videos%20and%20Assets'),
  'Legacy bucket URLs must rewrite to Oncosmart Videos and Assets',
);
assert(
  isLandscapePreviewVideoUrl(
    'https://x/Male%20Landscape%20Compressed/Diaphragmatic%20Breathing%20Male%20Landscape.mp4',
  ) === true,
  'Landscape preview URLs must be detected',
);

if (failed > 0) {
  console.error(`\n${failed} guided-video invariant(s) failed.`);
  process.exit(1);
}

console.log('\nAll guided-video invariants passed.');
