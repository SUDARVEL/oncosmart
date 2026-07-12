import type { ImageSource } from 'expo-image';

import type { AppGender } from '../store/useAppStore';

const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

const LANDSCAPE_FOLDER = 'Male Landscape Photos';

/**
 * Exact filenames from Male Landscape Photos — matched to exercise IDs.
 * (Triceps filenames use the storage spelling "Landsacpe".)
 */
const MALE_LANDSCAPE_PHOTO_FILES: Partial<Record<string, string>> = {
  'biceps-curls': 'biceps curls male landscape.png',
  'hamstring-stretch': 'Male Hamstring Landscape.png',
  'chest-stretch': 'Chest Stretch back male 1.png',
  'calf-stretch-right': 'Calf stretch Male Right Landscape.png',
  'calf-stretch-left': 'Calf stretch Male Left Landscape.png',
  'neck-stretch-left': 'Neck stretch Left Male Landscape.png',
  'neck-stretch-right': 'Neck stretch Right Male Landscape.png',
  'quadriceps-stretch-left': 'Quadriceps Stretch Male Left.png',
  'quadriceps-stretch-right': 'Quadriceps Stretch Male Right.png',
  'triceps-stretch-left': 'Triceps Stretch Left Male Landsacpe.png',
  'triceps-stretch-right': 'Triceps Stretch Right Male Landsacpe.png',
};

const landscapeUrlCache = new Map<string, string>();

function encodeObjectPath(objectPath: string): string {
  return objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function buildLandscapeUrl(fileName: string): string {
  return `${SUPABASE_PUBLIC_BASE}/${encodeObjectPath(`${LANDSCAPE_FOLDER}/${fileName}`)}`;
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

  const url = buildLandscapeUrl(file);
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
