import type { AppGender } from '../store/useAppStore';

const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

const MALE_SLIDER_PHOTOS_PREFIX = 'Male Slider Photos';

/** Figma / Supabase slider images — filenames must match storage exactly. */
const MALE_SLIDER_PHOTO_FILES: Record<string, string> = {
  'diaphragmatic-breathing': 'Diaphgrametic Breathing Slider.png',
  'ankle-pumps': 'Ankle Pump Slider.png',
  'thoracic-expansion': 'Thoracic Expansion Slider.png',
  'arm-circles': 'Arm Circles Slider.png',
  'spot-marching': 'Spot Marching slider.png',
  'shoulder-shrugging': 'Shoulder Shrugging Slider.png',
  'biceps-curls': 'Bicep Curls Slider.png',
  'wall-pushup': 'Wall pushup Slider.png',
  'calf-raise': 'Calf Rises Slider.png',
  'sit-to-stand': 'Sit to stand slider.png',
  'straight-leg-raise-right': 'straight leg raise slider.png',
  'straight-leg-raise-left': 'straight leg raise left slider.png',
  'knee-to-chest-right': 'Knee to chest right.png',
  'knee-to-chest-left': 'Knee to chest left.png',
  'static-quadriceps-right': 'Static quadricepts left.png',
  'static-quadriceps-left': 'Static quadricepts left.png',
  'hamstring-stretch': 'hamstring stretch.png',
  'quadriceps-stretch-right': 'quadricep right stretch.png',
  'quadriceps-stretch-left': 'Quadricep left stretch.png',
  'calf-stretch-right': 'Calf strectch right slider.png',
  'calf-stretch-left': 'Calf stretch left slider.png',
  'chest-stretch': 'Pectoral Stretch Slider.png',
  'triceps-stretch-right': 'Triceps Stretch (Right).png',
  'triceps-stretch-left': 'Triceps Stretch (left).png',
  'neck-stretch-right': 'Neck Stretch ( right ).png',
  'neck-stretch-left': 'Neck Stretch Left.png',
};

const sliderPhotoUrlCache = new Map<string, string>();

function encodeObjectPath(objectPath: string): string {
  return objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function getWorkoutSliderPhotoUrl(
  exerciseId: string,
  gender: AppGender | null,
): string | null {
  if (gender === 'female') return null;

  const photoFile = MALE_SLIDER_PHOTO_FILES[exerciseId];
  if (!photoFile) return null;

  const cacheKey = `${exerciseId}|${photoFile}`;
  const cached = sliderPhotoUrlCache.get(cacheKey);
  if (cached) return cached;

  const objectPath = `${MALE_SLIDER_PHOTOS_PREFIX}/${photoFile}`;
  const url = `${SUPABASE_PUBLIC_BASE}/${encodeObjectPath(objectPath)}`;
  sliderPhotoUrlCache.set(cacheKey, url);
  return url;
}
