import { env, isStoragePublicConfigured } from './env';
import {
  CANONICAL_SUPABASE_URL,
  CANONICAL_VIDEO_BUCKET,
  normalizeVideoBucket,
  sanitizePublicVideoUrl,
} from './videoStoragePolicy';

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

  const baseUrl = env.supabaseUrl || CANONICAL_SUPABASE_URL;
  const bucket = normalizeVideoBucket(env.videoBucket || CANONICAL_VIDEO_BUCKET);
  const encodedPath = encodeStorageObjectPath(normalized);

  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`;
}

/** Public URL for a file in the Oncosmart Videos and Assets bucket. */
export function getPublicStorageUrl(objectPath: string): string | null {
  if (!isStoragePublicConfigured() && !CANONICAL_SUPABASE_URL) return null;
  return buildPublicStorageUrl(objectPath);
}

/** Same as getPublicStorageUrl — pure URL builder, no SDK/network call. */
export function getPublicVideoUrl(objectPath: string): string | null {
  return getPublicStorageUrl(objectPath);
}

export { sanitizePublicVideoUrl, CANONICAL_VIDEO_BUCKET };
