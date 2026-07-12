import type { AppGender } from '../store/useAppStore';
import type { GrowthPlaceholderFitConfig } from './fitGrowthPlaceholderSvg';

const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

const PLACEHOLDER_FOLDER = 'Male Workouts placeholder';

/**
 * Exact filenames in Male Workouts placeholder (66×70 circular SVGs).
 * Filenames must match storage exactly (including casing / missing spaces).
 */
const MALE_WORKOUT_PLACEHOLDER_FILES: Partial<Record<string, string>> = {
  'diaphragmatic-breathing': 'Diaphragmatic Breathing.svg',
  'ankle-pumps': 'Ankle Pumps.svg',
  'arm-circles': 'arm circles.svg',
  'thoracic-expansion': 'thoracic expansion.svg',
  'sit-to-stand': 'sit to stand.svg',
  'straight-leg-raise-left': 'slr left.svg',
  'straight-leg-raise-right': 'slr right.svg',
  'knee-to-chest-left': 'knee to chest left.svg',
  'knee-to-chest-right': 'knee to chest right.svg',
  'static-quadriceps-left': 'static quadriceps left.svg',
  'static-quadriceps-right': 'static quadriceps right.svg',
  'hamstring-stretch': 'hamstring stretch.svg',
  'chest-stretch': 'Chest stretch.svg',
  'quadriceps-stretch-left': 'quadriceps stretch left.svg',
  'quadriceps-stretch-right': 'quadriceps stretch right.svg',
  'calf-stretch-left': 'calf stretch left.svg',
  'calf-stretch-right': 'calf stretch right.svg',
  'triceps-stretch-right': 'triceps stretch right.svg',
  'triceps-stretch-left': 'triceps stretchleft.svg',
  'neck-stretch-left': 'neck stretch left.svg',
  'neck-stretch-right': 'neck stretch right.svg',
};

/**
 * Per-exercise crop: keep the pose readable in the circle without clipping the body.
 * fill 0 = full photo (small), 1 = fill circle (may cut). Values are tuned per pose.
 */
const MALE_WORKOUT_PLACEHOLDER_FIT: Partial<Record<string, GrowthPlaceholderFitConfig>> = {
  // Seated — near fill, slight lift so feet stay inside the round mask.
  'thoracic-expansion': { fill: 0.9, offsetY: -0.05 },
  'sit-to-stand': { fill: 0.9, offsetY: -0.05 },
  // Floor / horizontal — show full body, but tighter than full zoom-out so pose is clear.
  'straight-leg-raise-left': { fill: 0.32, offsetY: -0.08 },
  'straight-leg-raise-right': { fill: 0.32, offsetY: -0.08 },
};

export function getWorkoutGrowthPlaceholderFit(
  exerciseId: string,
): GrowthPlaceholderFitConfig | null {
  return MALE_WORKOUT_PLACEHOLDER_FIT[exerciseId] ?? null;
}

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
