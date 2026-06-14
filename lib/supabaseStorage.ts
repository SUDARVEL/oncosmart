import { env, isSupabaseConfigured } from './env';
import { getSupabase } from './supabase';

/** Public URL for a file in the exercise-videos bucket (no API call needed). */
export function getPublicStorageUrl(objectPath: string): string | null {
  if (!isSupabaseConfigured()) return null;

  const normalized = objectPath.replace(/^\/+/, '');
  if (!normalized) return null;

  return `${env.supabaseUrl}/storage/v1/object/public/${env.videoBucket}/${normalized}`;
}

/** Same as getPublicStorageUrl but uses the Supabase SDK helper when client exists. */
export function getPublicVideoUrl(objectPath: string): string | null {
  const supabase = getSupabase();
  if (!supabase) return getPublicStorageUrl(objectPath);

  const normalized = objectPath.replace(/^\/+/, '');
  if (!normalized) return null;

  const { data } = supabase.storage.from(env.videoBucket).getPublicUrl(normalized);
  return data.publicUrl;
}
