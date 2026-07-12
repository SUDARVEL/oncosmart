import { getPublicVideoUrl, sanitizePublicVideoUrl } from './supabaseStorage';
import { memoizeStringResolver } from './urlCache';

const DRIVE_FILE_ID_PATTERN =
  /(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=|drive\.google\.com\/uc\?(?:export=(?:view|download)&)?id=)([a-zA-Z0-9_-]+)/;

/** Direct streaming URL for Google Drive files (works with expo-video when file is shared publicly). */
export function toGoogleDriveStreamUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/**
 * Normalizes video sources for playback.
 * - Supabase storage paths → public URL on the canonical Oncosmart bucket
 * - Legacy `exercise-videos` bucket URLs are rewritten automatically
 * - Google Drive share/view/download links → direct stream URL
 */
function resolveVideoUrlUncached(source: string): string {
  const trimmed = source.trim();
  if (!trimmed) return trimmed;

  if (!isHttpUrl(trimmed)) {
    const storageUrl = getPublicVideoUrl(trimmed);
    if (storageUrl) return storageUrl;
    return trimmed;
  }

  const match = trimmed.match(DRIVE_FILE_ID_PATTERN);
  if (match?.[1]) {
    return toGoogleDriveStreamUrl(match[1]);
  }

  return sanitizePublicVideoUrl(trimmed);
}

export const resolveVideoUrl = memoizeStringResolver(resolveVideoUrlUncached);
