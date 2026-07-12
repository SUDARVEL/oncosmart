import type { ImageSource } from 'expo-image';

import type { AppGender } from '../store/useAppStore';

const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

const LANDSCAPE_FOLDER = 'Male Landscape Photos';

/**
 * Exact filenames in Male Landscape Photos (landscape stills for stretch cards).
 * Naming follows: "{Exercise} stretch Male {Side?} Landscape.png"
 */
const MALE_LANDSCAPE_PHOTO_FILES: Partial<Record<string, string>> = {
  'calf-stretch-left': 'Calf stretch Male Left Landscape.png',
  'calf-stretch-right': 'Calf stretch Male Right Landscape.png',
};

/** Stretch IDs verified present in Male Landscape Photos. */
const CONFIRMED_LANDSCAPE_PHOTO_IDS = new Set(Object.keys(MALE_LANDSCAPE_PHOTO_FILES));

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

  if (!CONFIRMED_LANDSCAPE_PHOTO_IDS.has(exerciseId)) return null;

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
