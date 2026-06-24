const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

/** User-provided folder name in Supabase (spelling preserved). */
const PORTRAIT_VIDEOS_PREFIX = 'Male Potrait English videos';

function encodeObjectPath(objectPath: string): string {
  return objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function getPortraitVideoUrl(filename: string | null | undefined): string | null {
  if (!filename?.trim()) return null;

  const objectPath = `${PORTRAIT_VIDEOS_PREFIX}/${filename.trim()}`;
  return `${SUPABASE_PUBLIC_BASE}/${encodeObjectPath(objectPath)}`;
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
