import type { ImageSource } from 'expo-image';

import type { AppAvatar, AppGender } from '../store/useAppStore';
import { FEMALE_LANDSCAPE_FOLDER } from './exerciseFemaleVideos';
import { isFemaleMediaTrack } from './exerciseMediaUrls';

const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

const MALE_LANDSCAPE_FOLDER = 'Male Landscape Photos';

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

/**
 * Exact filenames from Female Landscape folder (verified HTTP 200).
 * Keep typos/spacing exactly (Landsacpe, RightFemale, double spaces).
 */
const FEMALE_LANDSCAPE_PHOTO_FILES: Partial<Record<string, string>> = {
  'calf-stretch-left': 'Calf stretch Female Left Landscape.png',
  'calf-stretch-right': 'Calf stretch Female Right Landscape.png',
  // Double space before "Female" is intentional.
  'chest-stretch': 'Chest Stretch Back  Female 1.png',
  'hamstring-stretch': 'FemaleHamstring Landscape.png',
  'knee-to-chest-left': 'Knee to chest Left Female Landscape.png',
  // No space before "Female" is intentional.
  'knee-to-chest-right': 'Knee to chest RightFemale Landscape.png',
  'neck-stretch-left': 'Neck stretch Left Female Landscape.png',
  'neck-stretch-right': 'Neck stretch Right Female Landscape.png',
  'quadriceps-stretch-left': 'Quadriceps Stretch Female Left.png',
  'quadriceps-stretch-right': 'Quadriceps Stretch Female Right.png',
  'shoulder-shrugging': 'Shoulder shrugging Female Landscape.png',
  'sit-to-stand': 'sit to stand Female Landscape.png',
  'triceps-stretch-left': 'Triceps Stretch Left Female Landsacpe.png',
  'triceps-stretch-right': 'Triceps Stretch Right Female Landsacpe.png',
  'wall-pushup': 'Wall Pushup Female Landscape.png',
};

const landscapeUrlCache = new Map<string, string>();

function encodeObjectPath(objectPath: string): string {
  return objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function buildLandscapeUrl(folder: string, fileName: string): string {
  return `${SUPABASE_PUBLIC_BASE}/${encodeObjectPath(`${folder}/${fileName}`)}`;
}

export function getSessionLandscapePhotoUrl(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): string | null {
  const isFemale = isFemaleMediaTrack(gender, avatar);
  const file = isFemale
    ? FEMALE_LANDSCAPE_PHOTO_FILES[exerciseId]
    : MALE_LANDSCAPE_PHOTO_FILES[exerciseId];
  if (!file) return null;

  const folder = isFemale ? FEMALE_LANDSCAPE_FOLDER : MALE_LANDSCAPE_FOLDER;
  const cacheKey = `${isFemale ? 'f' : 'm'}|${exerciseId}|${file}`;
  const cached = landscapeUrlCache.get(cacheKey);
  if (cached) return cached;

  const url = buildLandscapeUrl(folder, file);
  landscapeUrlCache.set(cacheKey, url);
  return url;
}

export function resolveSessionLandscapePhotoSource(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): ImageSource | null {
  const url = getSessionLandscapePhotoUrl(exerciseId, gender, avatar);
  return url ? { uri: url } : null;
}
