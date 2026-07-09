import { PORTRAIT_VIDEO_FOLDER } from './exercisePortraitVideos';

const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

/** User-provided folder name in Supabase (spelling preserved). */
const PORTRAIT_VIDEOS_PREFIX = PORTRAIT_VIDEO_FOLDER;

const portraitUrlCache = new Map<string, string>();

function encodeObjectPath(objectPath: string): string {
  return objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function getPortraitVideoUrl(filename: string | null | undefined): string | null {
  if (!filename?.trim()) return null;

  const trimmed = filename.trim();
  const cached = portraitUrlCache.get(trimmed);
  if (cached) return cached;

  const objectPath = `${PORTRAIT_VIDEOS_PREFIX}/${trimmed}`;
  const url = `${SUPABASE_PUBLIC_BASE}/${encodeObjectPath(objectPath)}`;
  portraitUrlCache.set(trimmed, url);
  return url;
}

export function resolveSessionVideoUrl(
  portraitFilename: string | null | undefined,
  landscapeFallback: string | null,
): string | null {
  const portraitUrl = getPortraitVideoUrl(portraitFilename);

  if (portraitUrl) {
    return portraitUrl;
  }

  return landscapeFallback;
}

export function resolveSessionVideoSources(
  portraitFilename: string | null | undefined,
  landscapeFallback: string | null,
): string[] {
  const portraitUrl = getPortraitVideoUrl(portraitFilename);
  const sources = [portraitUrl, landscapeFallback].filter(
    (value): value is string => Boolean(value?.trim()),
  );

  return [...new Set(sources)];
}
