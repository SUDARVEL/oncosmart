import type { AppGender } from '../store/useAppStore';

const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

const PLACEHOLDER_FOLDER = 'Male Workouts placeholder';

/**
 * Exact filenames verified in Male Workouts placeholder (66×70 circular SVGs).
 * Add more entries as files are uploaded to this folder.
 */
const MALE_WORKOUT_PLACEHOLDER_FILES: Partial<Record<string, string>> = {
  'diaphragmatic-breathing': '0001-0060 9Diaphragmatic Breathing .svg',
  'ankle-pumps': 'Ankle Pumps.svg',
};

const urlCache = new Map<string, string>();

function encodeObjectPath(objectPath: string): string {
  return objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function getWorkoutGrowthPlaceholderUrl(
  exerciseId: string,
  gender: AppGender | null,
): string | null {
  if (gender === 'female') return null;

  const file = MALE_WORKOUT_PLACEHOLDER_FILES[exerciseId];
  if (!file) return null;

  const cached = urlCache.get(exerciseId);
  if (cached) return cached;

  const url = `${SUPABASE_PUBLIC_BASE}/${encodeObjectPath(`${PLACEHOLDER_FOLDER}/${file}`)}`;
  urlCache.set(exerciseId, url);
  return url;
}
