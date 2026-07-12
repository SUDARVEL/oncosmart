/**
 * Canonical Supabase storage for Oncosmart exercise media.
 * NEVER use the legacy `exercise-videos` bucket — it 404s and breaks playback.
 */
export const CANONICAL_SUPABASE_URL = 'https://soyaeuffzytrjojifvdz.supabase.co';
export const CANONICAL_VIDEO_BUCKET = 'Oncosmart Videos and Assets';

const LEGACY_VIDEO_BUCKETS = new Set([
  'exercise-videos',
  'exercise_videos',
  'Exercise Videos',
]);

export function normalizeVideoBucket(bucket: string | null | undefined): string {
  const trimmed = bucket?.trim() || CANONICAL_VIDEO_BUCKET;
  if (LEGACY_VIDEO_BUCKETS.has(trimmed)) {
    return CANONICAL_VIDEO_BUCKET;
  }
  return trimmed;
}

/** Rewrite any public URL that still points at a legacy/wrong video bucket. */
export function sanitizePublicVideoUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  return trimmed
    .replace(
      /\/storage\/v1\/object\/public\/exercise-videos\//gi,
      `/storage/v1/object/public/${encodeURIComponent(CANONICAL_VIDEO_BUCKET)}/`,
    )
    .replace(
      /\/storage\/v1\/object\/public\/exercise_videos\//gi,
      `/storage/v1/object/public/${encodeURIComponent(CANONICAL_VIDEO_BUCKET)}/`,
    )
    .replace(
      /\/storage\/v1\/object\/public\/exercise%2Dvideos\//gi,
      `/storage/v1/object/public/${encodeURIComponent(CANONICAL_VIDEO_BUCKET)}/`,
    );
}

/** True when a URL is a short landscape preview — never use for guided full playback. */
export function isLandscapePreviewVideoUrl(url: string): boolean {
  try {
    const decoded = decodeURIComponent(url);
    return /Landscape/i.test(decoded);
  } catch {
    return /Landscape/i.test(url);
  }
}

/** Guided session videos must be portrait instructor clips from the canonical bucket. */
export function isValidGuidedPlaybackUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const sanitized = sanitizePublicVideoUrl(url);
  if (isLandscapePreviewVideoUrl(sanitized)) return false;
  return (
    sanitized.includes('/storage/v1/object/public/') &&
    (sanitized.includes(encodeURIComponent(CANONICAL_VIDEO_BUCKET)) ||
      sanitized.includes(CANONICAL_VIDEO_BUCKET))
  );
}
