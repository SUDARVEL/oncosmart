/**
 * Official stills for the Newly added exercises.
 * Placeholders are the portrait frames (growth circle and slider).
 * Landscape files are the wide session-card previews.
 * Paths are bucket-relative and match storage exactly, including spacing.
 */

import type { ImageSource } from 'expo-image';

import type { AppAvatar, AppGender } from '../store/useAppStore';
import { exerciseSlugFromId } from './phase2PlaceholderMedia';

const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

const FEMALE_PLACEHOLDERS: Partial<Record<string, string>> = {
  'arm-circles-short-lever':
    'Newly added Female/PH -  New Female-20261120T182254Z-1-001/PH -  New Female/Arm circles FeMale  short lever.png',
  'shoulder-external-rotation':
    'Newly added Female/PH -  New Female-20261120T182254Z-1-001/PH -  New Female/ER Female.png',
  'incentive-spirometer':
    'Newly added Female/PH -  New Female-20261120T182254Z-1-001/PH -  New Female/Female spirometer 3.png',
  'hamstring-stretch-left':
    'Newly added Female/PH -  New Female-20261120T182254Z-1-001/PH -  New Female/Hamstring stretch with chair Female left.png',
  'hamstring-stretch-right':
    'Newly added Female/PH -  New Female-20261120T182254Z-1-001/PH -  New Female/Hamstring stretch with chair Female right .png',
  'heel-slides-left':
    'Newly added Female/PH -  New Female-20261120T182254Z-1-001/PH -  New Female/Heel slide feMale left.png',
  'heel-slides-right':
    'Newly added Female/PH -  New Female-20261120T182254Z-1-001/PH -  New Female/Heel slide feMale right.png',
  'neck-flexion-extension':
    'Newly added Female/PH -  New Female-20261120T182254Z-1-001/PH -  New Female/Neck Flexion -Extension FeMale.png',
  'neck-nodding':
    'Newly added Female/PH -  New Female-20261120T182254Z-1-001/PH -  New Female/Neck Nodding FeMale YES movement.png',
  'neck-rotation':
    'Newly added Female/PH -  New Female-20261120T182254Z-1-001/PH -  New Female/Neck rotation FeMale version .png',
  'neck-side-flexion':
    'Newly added Female/PH -  New Female-20261120T182254Z-1-001/PH -  New Female/Neck Side- Flexion FeMale Final 2.png',
  'pelvic-bridge':
    'Newly added Female/PH -  New Female-20261120T182254Z-1-001/PH -  New Female/pelvic bridge Female .png',
  'shoulder-retraction':
    'Newly added Female/PH -  New Female-20261120T182254Z-1-001/PH -  New Female/Shoulder Retraction FeMale combined nodding.png',
  'unilateral-bridge':
    'Newly added Female/PH -  New Female-20261120T182254Z-1-001/PH -  New Female/Unilateral pelvic bridge FeMale.png',
};

const MALE_PLACEHOLDERS: Partial<Record<string, string>> = {
  'arm-circles-short-lever':
    'Newly added Female/PH - New Male-20261120T182256Z-1-001/PH - New Male/Arm circles Male short lever.png',
  'shoulder-external-rotation':
    'Newly added Female/PH - New Male-20261120T182256Z-1-001/PH - New Male/ER Male.png',
  'incentive-spirometer':
    'Newly added Female/PH - New Male-20261120T182256Z-1-001/PH - New Male/Male spirometer 3 (2).png',
  'hamstring-stretch-left':
    'Newly added Female/PH - New Male-20261120T182256Z-1-001/PH - New Male/Hamstring stretch with chair male left.png',
  'hamstring-stretch-right':
    'Newly added Female/PH - New Male-20261120T182256Z-1-001/PH - New Male/Hamstring stretch with chair male right .png',
  'heel-slides-left':
    'Newly added Female/PH - New Male-20261120T182256Z-1-001/PH - New Male/Heel slide Male Left.png',
  'heel-slides-right':
    'Newly added Female/PH - New Male-20261120T182256Z-1-001/PH - New Male/Heel slide Male right.png',
  'neck-flexion-extension':
    'Newly added Female/PH - New Male-20261120T182256Z-1-001/PH - New Male/Neck Flexion - Extensio  Male.png',
  'neck-nodding':
    'Newly added Female/PH - New Male-20261120T182256Z-1-001/PH - New Male/Neck Nodding Male YES movement.png',
  'neck-rotation':
    'Newly added Female/PH - New Male-20261120T182256Z-1-001/PH - New Male/Neck rotation Male version .png',
  'neck-side-flexion':
    'Newly added Female/PH - New Male-20261120T182256Z-1-001/PH - New Male/Neck Side- Flexion Male Final 2.png',
  'pelvic-bridge':
    'Newly added Female/PH - New Male-20261120T182256Z-1-001/PH - New Male/Pelvic bridge male.png',
  'shoulder-retraction':
    'Newly added Female/PH - New Male-20261120T182256Z-1-001/PH - New Male/Shoulder Retraction Male combined.png',
  'unilateral-bridge':
    'Newly added Female/PH - New Male-20261120T182256Z-1-001/PH - New Male/Unilateral pelvic bridge Male.png',
};

const FEMALE_LANDSCAPE_VIDEOS: Partial<Record<string, string>> = {
  'arm-circles-short-lever':
    'Newly added Female/Landscape - New Female-20261120T182252Z-1-001/Landscape - New Female/Arm rotation FeMale short lever Landscape.mp4',
  'shoulder-external-rotation':
    'Newly added Female/Landscape - New Female-20261120T182252Z-1-001/Landscape - New Female/ER Female Landscape.mp4',
  'heel-slides-left':
    'Newly added Female/Landscape - New Female-20261120T182252Z-1-001/Landscape - New Female/Heel slide feMale left Landscape.mp4',
  'heel-slides-right':
    'Newly added Female/Landscape - New Female-20261120T182252Z-1-001/Landscape - New Female/Heel slide feMale Right Landscape.mp4',
  'neck-flexion-extension':
    'Newly added Female/Landscape - New Female-20261120T182252Z-1-001/Landscape - New Female/Neck Flexion-Extension Female Landscape.mp4',
  'neck-nodding':
    'Newly added Female/Landscape - New Female-20261120T182252Z-1-001/Landscape - New Female/Neck Nodding FeMale YES movement landscape.mp4',
  'neck-rotation':
    'Newly added Female/Landscape - New Female-20261120T182252Z-1-001/Landscape - New Female/Neck Rotation FeMale Landscape.mp4',
  'neck-side-flexion':
    'Newly added Female/Landscape - New Female-20261120T182252Z-1-001/Landscape - New Female/Neck Side- Flexion FeMale Landscape.mp4',
  'pelvic-bridge':
    'Newly added Female/Landscape - New Female-20261120T182252Z-1-001/Landscape - New Female/Pelvic bridge FeMale Landscape.mp4',
  'shoulder-retraction':
    'Newly added Female/Landscape - New Female-20261120T182252Z-1-001/Landscape - New Female/Shoulder Retraction FeMale Landscape.mp4',
  'unilateral-bridge':
    'Newly added Female/Landscape - New Female-20261120T182252Z-1-001/Landscape - New Female/Unilateral pelvic bridge Female Landscape.mp4',
};

const MALE_LANDSCAPE_VIDEOS: Partial<Record<string, string>> = {
  'arm-circles-short-lever':
    'Newly added Female/Landscape - New male-20261120T182252Z-1-001/Landscape - New male/Arm rotation Male short lever Landscape.mp4',
  'shoulder-external-rotation':
    'Newly added Female/Landscape - New male-20261120T182252Z-1-001/Landscape - New male/ER Male Landscape.mp4',
  'heel-slides-left':
    'Newly added Female/Landscape - New male-20261120T182252Z-1-001/Landscape - New male/Heel slide Male left Landscape.mp4',
  'heel-slides-right':
    'Newly added Female/Landscape - New male-20261120T182252Z-1-001/Landscape - New male/Heel slide Male Right Landscape.mp4',
  'neck-flexion-extension':
    'Newly added Female/Landscape - New male-20261120T182252Z-1-001/Landscape - New male/Neck Flexion-Extension Male Landscape.mp4',
  'neck-nodding':
    'Newly added Female/Landscape - New male-20261120T182252Z-1-001/Landscape - New male/Neck Nodding Male YES movement landscape.mp4',
  'neck-rotation':
    'Newly added Female/Landscape - New male-20261120T182252Z-1-001/Landscape - New male/Neck Rotation  Male Landscape.mp4',
  'neck-side-flexion':
    'Newly added Female/Landscape - New male-20261120T182252Z-1-001/Landscape - New male/Neck Side- Flexion Male Landscape.mp4',
  'pelvic-bridge':
    'Newly added Female/Landscape - New male-20261120T182252Z-1-001/Landscape - New male/Pelvic bridge Male Landscape.mp4',
  'shoulder-retraction':
    'Newly added Female/Landscape - New male-20261120T182252Z-1-001/Landscape - New male/Shoulder Retraction Male Landscape.mp4',
  'unilateral-bridge':
    'Newly added Female/Landscape - New male-20261120T182252Z-1-001/Landscape - New male/Unilateral Pelvic Bridge Landscape.mp4',
};

const FEMALE_LANDSCAPE_PHOTOS: Partial<Record<string, string>> = {
  'incentive-spirometer':
    'Newly added Female/Landscape - New Female-20261120T182252Z-1-001/Landscape - New Female/FeMale spirometer Landscape.png',
  'hamstring-stretch-left':
    'Newly added Female/Landscape - New Female-20261120T182252Z-1-001/Landscape - New Female/Hamstring stretch with chair Female left Landscape.png',
  'hamstring-stretch-right':
    'Newly added Female/Landscape - New Female-20261120T182252Z-1-001/Landscape - New Female/Hamstring stretch with chair Female right Landscape.png',
};

const MALE_LANDSCAPE_PHOTOS: Partial<Record<string, string>> = {
  'incentive-spirometer':
    'Newly added Female/Landscape - New male-20261120T182252Z-1-001/Landscape - New male/Male spirometer Landscape.png',
  'hamstring-stretch-left':
    'Newly added Female/Landscape - New male-20261120T182252Z-1-001/Landscape - New male/Hamstring stretch with chair male left Landscape.png',
  'hamstring-stretch-right':
    'Newly added Female/Landscape - New male-20261120T182252Z-1-001/Landscape - New male/Hamstring stretch with chair male right Landscape.png',
};

/**
 * The spirometer art was rendered on a lavender backdrop. These copies use the
 * same neutral grey studio background as every other placeholder.
 */
const SPIROMETER_PORTRAIT: Record<'female' | 'male', ImageSource> = {
  female: require('../assets/workouts/stills/spirometer/female-portrait.jpg'),
  male: require('../assets/workouts/stills/spirometer/male-portrait.jpg'),
};

const SPIROMETER_LANDSCAPE: Record<'female' | 'male', ImageSource> = {
  female: require('../assets/workouts/stills/spirometer/female-landscape.jpg'),
  male: require('../assets/workouts/stills/spirometer/male-landscape.jpg'),
};

function isSpirometer(exerciseId: string): boolean {
  return exerciseSlugFromId(exerciseId) === 'incentive-spirometer';
}

const urlCache = new Map<string, string>();

function isFemale(gender: AppGender | null, avatar: AppAvatar | null): boolean {
  return avatar ? avatar === 'female' : gender === 'female';
}

function encodeObjectPath(objectPath: string): string {
  return objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function publicUrl(objectPath: string): string {
  const cached = urlCache.get(objectPath);
  if (cached) return cached;
  const url = `${SUPABASE_PUBLIC_BASE}/${encodeObjectPath(objectPath)}`;
  urlCache.set(objectPath, url);
  return url;
}

/** Breast Level 1 arm circles are the short-lever clip. Other arm circles stay on the older art. */
export function isBreastLevel1ArmCircles(exerciseId: string): boolean {
  const slug = exerciseSlugFromId(exerciseId).replace(/-(left|right)$/i, '');
  if (slug !== 'arm-circles' && slug !== 'arm-rotation') return false;
  return /pathway-breast-l1-/i.test(exerciseId);
}

function lookupKeys(exerciseId: string): string[] {
  const id = exerciseSlugFromId(exerciseId);
  const base = id.replace(/-(left|right)$/i, '');
  const keys: string[] = [];
  if (isBreastLevel1ArmCircles(exerciseId)) keys.push('arm-circles-short-lever');
  keys.push(id);
  if (base !== id) keys.push(base);
  if (base === id) keys.push(`${base}-left`, `${base}-right`);
  return [...new Set(keys)];
}

function lookup(
  map: Partial<Record<string, string>>,
  exerciseId: string,
): string | null {
  for (const key of lookupKeys(exerciseId)) {
    const path = map[key];
    if (path) return path;
  }
  return null;
}

export function getNewExercisePlaceholderUrl(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): string | null {
  const path = lookup(
    isFemale(gender, avatar) ? FEMALE_PLACEHOLDERS : MALE_PLACEHOLDERS,
    exerciseId,
  );
  return path ? publicUrl(path) : null;
}

export function getNewExercisePlaceholderSource(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): ImageSource | null {
  if (isSpirometer(exerciseId)) {
    return SPIROMETER_PORTRAIT[isFemale(gender, avatar) ? 'female' : 'male'];
  }
  const url = getNewExercisePlaceholderUrl(exerciseId, gender, avatar);
  return url ? { uri: url } : null;
}

const HEAD_UP_CARD_SLUGS = new Set([
  'incentive-spirometer',
  'neck-flexion-extension',
  'neck-nodding',
  'neck-rotation',
  'neck-side-flexion',
  'shoulder-retraction',
]);

/**
 * The 16:9 landscape art is cropped to the 257×112 card. These exercises have
 * the head near the top of the frame, so a centered crop cuts the head off.
 */
export function isNewLibraryHeadUpPreview(
  exerciseId: string,
  mediaUri: string | number | null | undefined,
): boolean {
  if (mediaUri == null) return false;
  if (typeof mediaUri === 'string' && !/Newly(%20| )added/i.test(mediaUri)) return false;
  return HEAD_UP_CARD_SLUGS.has(
    exerciseSlugFromId(exerciseId).replace(/-(left|right)$/i, ''),
  );
}

export function resolveNewExerciseCardPreview(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): { previewVideo: string | null; previewPhoto: ImageSource | null } {
  const female = isFemale(gender, avatar);
  if (isSpirometer(exerciseId)) {
    return {
      previewVideo: null,
      previewPhoto: SPIROMETER_LANDSCAPE[female ? 'female' : 'male'],
    };
  }
  const videoPath = lookup(
    female ? FEMALE_LANDSCAPE_VIDEOS : MALE_LANDSCAPE_VIDEOS,
    exerciseId,
  );
  const photoPath = lookup(
    female ? FEMALE_LANDSCAPE_PHOTOS : MALE_LANDSCAPE_PHOTOS,
    exerciseId,
  );
  return {
    previewVideo: videoPath ? publicUrl(videoPath) : null,
    previewPhoto: photoPath ? { uri: publicUrl(photoPath) } : null,
  };
}
