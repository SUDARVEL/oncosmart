const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
/** Must match the real public bucket name in Supabase Storage. */
const videoBucket =
  process.env.EXPO_PUBLIC_SUPABASE_VIDEO_BUCKET?.trim() || 'Oncosmart Videos and Assets';

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
