import { CANONICAL_SUPABASE_URL, CANONICAL_VIDEO_BUCKET, normalizeVideoBucket } from './videoStoragePolicy';

/**
 * Public project defaults so auth + storage work in any build without extra config.
 * The anon key is a PUBLIC client key (safe to ship) — data is protected by RLS.
 * Override via EXPO_PUBLIC_SUPABASE_* env vars to point at a different project.
 */
const CANONICAL_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNveWFldWZmenl0cmpvamlmdmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjk2MzYsImV4cCI6MjA5Njk0NTYzNn0.WmitCLz5piK5C4r4WJ5mHX50gRn-BOGFnPQH-bJZfCY';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || CANONICAL_SUPABASE_URL;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || CANONICAL_SUPABASE_ANON_KEY;

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
