import { env, isStoragePublicConfigured } from './env';

const FALLBACK_SUPABASE_URL = 'https://soyaeuffzytrjojifvdz.supabase.co';
const FALLBACK_VIDEO_BUCKET = 'Oncosmart Videos and Assets';

function encodeStorageObjectPath(objectPath: string): string {
  return objectPath
    .replace(/^\/+/, '')
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function buildPublicStorageUrl(objectPath: string): string | null {
  const normalized = objectPath.replace(/^\/+/, '');
  if (!normalized) return null;

  const baseUrl = env.supabaseUrl || FALLBACK_SUPABASE_URL;
  const bucket = env.videoBucket || FALLBACK_VIDEO_BUCKET;
  const encodedPath = encodeStorageObjectPath(normalized);

  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`;
}

/** Public URL for a file in the exercise-videos bucket (no API call needed). */
export function getPublicStorageUrl(objectPath: string): string | null {
  if (!isStoragePublicConfigured() && !FALLBACK_SUPABASE_URL) return null;
  return buildPublicStorageUrl(objectPath);
}

/** Same as getPublicStorageUrl — pure URL builder, no SDK/network call. */
export function getPublicVideoUrl(objectPath: string): string | null {
  return getPublicStorageUrl(objectPath);
}
