import type { ImageSource } from 'expo-image';

import type { AppGender } from '../store/useAppStore';

const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

const LANDSCAPE_FOLDER = 'Male Landscape Photos';

/**
 * Exact filenames verified in Male Landscape Photos.
 * Naming example: "biceps curls male landscape.png"
 */
const MALE_LANDSCAPE_PHOTO_FILES: Partial<Record<string, string>> = {
  'biceps-curls': 'biceps curls male landscape.png',
  'calf-stretch-left': 'Calf stretch Male Left Landscape.png',
  'calf-stretch-right': 'Calf stretch Male Right Landscape.png',
};

/** Shared landscape still for session cards that have no looping video yet. */
const DEFAULT_LANDSCAPE_PHOTO = 'biceps curls male landscape.png';

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

/**
 * Landscape photo for session cards with no looping video (stretches, etc.).
 * Uses exercise-specific Male Landscape Photos when available; otherwise the
 * shared landscape still so the 257×112 frame stays filled on every level.
 */
export function getSessionCardFallbackLandscapePhotoUrl(
  exerciseId: string,
  gender: AppGender | null,
): string | null {
  if (gender === 'female') return null;

  const specific = getSessionLandscapePhotoUrl(exerciseId, gender);
  if (specific) return specific;

  const cacheKey = `default-landscape|${DEFAULT_LANDSCAPE_PHOTO}`;
  const cached = landscapeUrlCache.get(cacheKey);
  if (cached) return cached;

  const url = buildLandscapeUrl(DEFAULT_LANDSCAPE_PHOTO);
  landscapeUrlCache.set(cacheKey, url);
  return url;
}

export function resolveSessionLandscapePhotoSource(
  exerciseId: string,
  gender: AppGender | null,
): ImageSource | null {
  const url = getSessionLandscapePhotoUrl(exerciseId, gender);
  return url ? { uri: url } : null;
}

export function resolveSessionCardFallbackLandscapePhotoSource(
  exerciseId: string,
  gender: AppGender | null,
): ImageSource | null {
  const url = getSessionCardFallbackLandscapePhotoUrl(exerciseId, gender);
  return url ? { uri: url } : null;
}
