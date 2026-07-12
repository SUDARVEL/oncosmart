import type { AppAvatar, AppGender } from '../store/useAppStore';
import {
  EXERCISE_PORTRAIT_VIDEOS,
  PORTRAIT_VIDEO_FOLDER,
} from './exercisePortraitVideos';
import {
  getFemaleLandscapeVideoPath,
  getFemalePortraitVideoPath,
} from './exerciseFemaleVideos';

const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

const MALE_LANDSCAPE_FOLDER =
  'Male Landscape Compressed/Oncosmart Male Compressed Landscape';

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

/** Cache by full object path so male/female never collide. */
const urlCache = new Map<string, string>();

function encodePath(path: string): string {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function publicUrlForObjectPath(objectPath: string): string {
  const cached = urlCache.get(objectPath);
  if (cached) return cached;
  const url = `${SUPABASE_PUBLIC_BASE}/${encodePath(objectPath)}`;
  urlCache.set(objectPath, url);
  return url;
}

export function isFemaleMediaTrack(
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): boolean {
  return avatar === 'female' || gender === 'female';
}

export function getExercisePortraitObjectPath(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): string | null {
  if (isFemaleMediaTrack(gender, avatar)) {
    return getFemalePortraitVideoPath(exerciseId);
  }

  const file = EXERCISE_PORTRAIT_VIDEOS[exerciseId];
  if (!file) return null;
  return `${PORTRAIT_VIDEO_FOLDER}/${file}`;
}

export function getExercisePortraitVideoUrl(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): string | null {
  const path = getExercisePortraitObjectPath(exerciseId, gender, avatar);
  if (!path) return null;
  // Prefer the known public bucket URL — avoid wrong EXPO_PUBLIC_SUPABASE_VIDEO_BUCKET defaults.
  return publicUrlForObjectPath(path);
}

export function getSessionLandscapeVideoUrl(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): string | null {
  if (isFemaleMediaTrack(gender, avatar)) {
    const path = getFemaleLandscapeVideoPath(exerciseId);
    return path ? publicUrlForObjectPath(path) : null;
  }

  const file = MALE_LANDSCAPE_VIDEO_FILES[exerciseId];
  if (!file) return null;
  return publicUrlForObjectPath(`${MALE_LANDSCAPE_FOLDER}/${file}`);
}

/** Portrait URL for guided exercise playback — full-length instructor video only. */
export function resolveExerciseGuidedPortraitUrl(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): string | null {
  return getExercisePortraitVideoUrl(exerciseId, gender, avatar);
}

/** Portrait first only — landscape previews are NEVER guided playback sources. */
export function resolveExercisePlaybackSources(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): string[] {
  const portrait = getExercisePortraitVideoUrl(exerciseId, gender, avatar);
  return portrait ? [portrait] : [];
}
