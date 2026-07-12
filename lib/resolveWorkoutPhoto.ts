import type { ImageSource } from 'expo-image';

import { getDay1Thumbnail } from '../components/exercise/day1Thumbnails';
import type { AppGender } from '../store/useAppStore';
import { getWorkoutPhotoUrl } from './getWorkoutPhotoUrl';
import { getWorkoutSliderPhotoUrl } from './workoutSliderPhotoUrls';
import { getWorkoutLocalPhoto } from './workoutLocalPhotos';
import { resolveSessionLandscapePhotoSource } from './sessionLandscapePhotos';
import workoutPhotos from '../data/workout-photos.json';

function getPhotoFile(exerciseId: string): string | null {
  const track = workoutPhotos.male as Record<string, string | null>;
  return track[exerciseId] ?? null;
}

/**
 * Growth list oval thumbnails — prefer Male Slider Photos (portrait full-body),
 * then Male Landscape Photos. Avoid local Figma circle exports (grey dome baked in).
 */
export function resolveWorkoutPhotoSource(
  exerciseId: string,
  gender: AppGender | null,
): ImageSource | null {
  const sliderUrl = getWorkoutSliderPhotoUrl(exerciseId, gender);
  if (sliderUrl) return { uri: sliderUrl };

  const landscape = resolveSessionLandscapePhotoSource(exerciseId, gender);
  if (landscape) return landscape;

  const photoFile = getPhotoFile(exerciseId);
  const photoGender = gender === 'female' ? 'female' : 'male';
  const remoteUrl = getWorkoutPhotoUrl(photoFile, photoGender);
  if (remoteUrl) return { uri: remoteUrl };

  const day1Photo = getDay1Thumbnail(exerciseId);
  if (day1Photo) return day1Photo;

  return getWorkoutLocalPhoto(exerciseId);
}

/**
 * Workout info slider — uses dedicated Male Slider Photos from Supabase when available.
 */
export function resolveWorkoutSliderPhotoSource(
  exerciseId: string,
  gender: AppGender | null,
): ImageSource | null {
  const sliderUrl = getWorkoutSliderPhotoUrl(exerciseId, gender);
  if (sliderUrl) return { uri: sliderUrl };

  return resolveWorkoutPhotoSource(exerciseId, gender);
}
