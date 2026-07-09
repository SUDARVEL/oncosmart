const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

const MALE_PHOTOS_PREFIX = 'Male and Female png exports/Male photos';
const FEMALE_PHOTOS_PREFIX = 'Male and Female png exports/Female photos';

const photoUrlCache = new Map<string, string>();

function encodeObjectPath(objectPath: string): string {
  return objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function getWorkoutPhotoUrl(
  photoFile: string | null | undefined,
  gender: 'male' | 'female' | null,
): string | null {
  if (!photoFile?.trim()) return null;

  const cacheKey = `${gender ?? 'male'}|${photoFile.trim()}`;
  const cached = photoUrlCache.get(cacheKey);
  if (cached) return cached;

  const prefix = gender === 'female' ? FEMALE_PHOTOS_PREFIX : MALE_PHOTOS_PREFIX;
  const objectPath = `${prefix}/${photoFile.trim()}`;
  const url = `${SUPABASE_PUBLIC_BASE}/${encodeObjectPath(objectPath)}`;

  photoUrlCache.set(cacheKey, url);
  return url;
}
