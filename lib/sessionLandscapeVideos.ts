import type { AppGender } from '../store/useAppStore';

const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

const LANDSCAPE_FOLDER =
  'Male Landscape Compressed/Oncosmart Male Compressed Landscape';

/**
 * Exact filenames in Oncosmart Male Compressed Landscape.
 * Missing IDs fall back to session card photos until uploaded.
 */
const MALE_LANDSCAPE_VIDEO_FILES: Partial<Record<string, string>> = {
  'diaphragmatic-breathing': 'Diaphragmatic Breathing Male Landscape.mp4',
  'ankle-pumps': 'Ankle Pumps Male Landscape.mp4',
  'thoracic-expansion': 'Thoracic Expansion Excercise Male Landscape.mp4',
  'arm-circles': 'Arm Circle Male Landscape.mp4',
  'spot-marching': 'Spot Marching Male Landscape.mp4',
  'shoulder-shrugging': 'Shoulder Shrug Male Landscape.mp4',
  'biceps-curls': 'Biceps Curls Male Landscape.mp4',
  'wall-pushup': 'Wall Pushup Male Landscape.mp4',
  'calf-raise': 'Calf Raises Male Landscape.mp4',
  'sit-to-stand': 'Sit To Stand Male Landsacpe.mp4',
  'straight-leg-raise-left': 'Slr Left Male Landscape.mp4',
  'straight-leg-raise-right': 'Slr Right Male Landscape.mp4',
  'static-quadriceps-right': 'Static Quadriceps Right Male Landscape.mp4',
  'static-quadriceps-left': 'Static Quadriceps Left Male Landscape.mp4',
  'knee-to-chest-right': 'Knee To Chest Right Male Landscape.mp4',
  'knee-to-chest-left': 'Knee To Chest Left Male Landscape.mp4',
};

function encodePath(path: string): string {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function getSessionLandscapeVideoUrl(
  exerciseId: string,
  gender: AppGender | null,
): string | null {
  // Landscape compressed set is male for now
  if (gender === 'female') return null;

  const file = MALE_LANDSCAPE_VIDEO_FILES[exerciseId];
  if (!file) return null;

  return `${SUPABASE_PUBLIC_BASE}/${encodePath(`${LANDSCAPE_FOLDER}/${file}`)}`;
}
