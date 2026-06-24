import { getExerciseVideoSource } from './getExerciseVideo';
import type { VideoVariant } from './getExerciseVideo';
import { resolveVideoUrl } from './resolveVideoUrl';

const SUPABASE_EXPORTS_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets/Male%20and%20Female%20png%20exports';

export function guessSupabaseExerciseVideoUrl(
  exerciseName: string,
  variant: VideoVariant,
): string {
  const isFemale = variant.startsWith('female');
  const suffix = isFemale ? 'Female' : 'Male';
  const fileName = `${exerciseName} ${suffix}.mp4`;
  return `${SUPABASE_EXPORTS_BASE}/${encodeURIComponent(fileName)}`;
}

export function getDayPreviewFallback(
  day: number,
  language: Parameters<typeof getExerciseVideoSource>[1],
  gender: Parameters<typeof getExerciseVideoSource>[2],
  avatar: Parameters<typeof getExerciseVideoSource>[3],
): string | null {
  return getExerciseVideoSource(day, language, gender, avatar);
}

export function resolveExercisePlaybackUrl(
  explicitUrl: string | null,
  exerciseName: string,
  variant: VideoVariant,
): string | null {
  if (explicitUrl) return explicitUrl;
  return resolveVideoUrl(guessSupabaseExerciseVideoUrl(exerciseName, variant));
}
