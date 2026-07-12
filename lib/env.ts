import { CANONICAL_VIDEO_BUCKET, normalizeVideoBucket } from './videoStoragePolicy';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

/** Always resolve to the real Oncosmart bucket (legacy `exercise-videos` is remapped). */
const videoBucket = normalizeVideoBucket(
  process.env.EXPO_PUBLIC_SUPABASE_VIDEO_BUCKET?.trim() || CANONICAL_VIDEO_BUCKET,
);

export const env = {
  supabaseUrl,
  supabaseAnonKey,
  videoBucket,
};

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/** Public storage URLs only need project URL + bucket (no anon key). */
export function isStoragePublicConfigured(): boolean {
  return Boolean(supabaseUrl && videoBucket);
}
