import type { ImageSource } from 'expo-image';

import type { AppGender } from '../store/useAppStore';

const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

const LANDSCAPE_FOLDER = 'Oncomsart Male Landscape Photos';

/**
 * Exact Supabase filenames in Oncomsart Male Landscape Photos.
 * The number before "Images" matches the exercise order in the Level 1 program.
 */
const MALE_LANDSCAPE_PHOTO_FILES: Partial<Record<string, string>> = {
  'diaphragmatic-breathing': '0001-0070 1Images Landscape Male .jpg',
  'ankle-pumps': '0001-0075 2Images Landscape Male .jpg',
  'arm-circles': '0001-0080 4Images Landscape Male .jpg',
  'spot-marching': '0001-0080 5Images Landscape Male .jpg',
  'quadriceps-stretch-right': '0001-0060 7Images Landscape Male .jpg',
  'triceps-stretch-right': '0001-0060 12Images Landscape Male .jpg',
};

const landscapeUrlCache = new Map<string, string>();

function encodeObjectPath(objectPath: string): string {
  return objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function getSessionLandscapePhotoUrl(
  exerciseId: string,
  gender: AppGender | null,
): string | null {
  if (gender === 'female') return null;

  const file = MALE_LANDSCAPE_PHOTO_FILES[exerciseId];
  if (!file) return null;

  const cached = landscapeUrlCache.get(exerciseId);
  if (cached) return cached;

  const objectPath = `${LANDSCAPE_FOLDER}/${file}`;
  const url = `${SUPABASE_PUBLIC_BASE}/${encodeObjectPath(objectPath)}`;
  landscapeUrlCache.set(exerciseId, url);
  return url;
}

export function resolveSessionLandscapePhotoSource(
  exerciseId: string,
  gender: AppGender | null,
): ImageSource | null {
  const url = getSessionLandscapePhotoUrl(exerciseId, gender);
  return url ? { uri: url } : null;
}
