import type { ImageSource } from 'expo-image';

import type { AppGender } from '../store/useAppStore';
import { getWorkoutPhotoUrl } from './getWorkoutPhotoUrl';
import { getWorkoutLocalPhoto } from './workoutLocalPhotos';
import { getWorkoutSliderPhotoUrl } from './workoutSliderPhotoUrls';
import { resolveSessionLandscapePhotoSource } from './sessionLandscapePhotos';
import workoutPhotos from '../data/workout-photos.json';

function getPhotoFile(exerciseId: string): string | null {
  const track = workoutPhotos.male as Record<string, string | null>;
  return track[exerciseId] ?? null;
}

/**
 * Session list card preview for Figma landscape cards.
 * Stretches prefer Male Landscape Photos; otherwise Male Slider Photos, then fallbacks.
 */
export function resolveSessionCardPhotoSource(
  exerciseId: string,
  gender: AppGender | null,
): ImageSource | null {
  const landscape = resolveSessionLandscapePhotoSource(exerciseId, gender);
  if (landscape) return landscape;

  const sliderUrl = getWorkoutSliderPhotoUrl(exerciseId, gender);
  if (sliderUrl) return { uri: sliderUrl };

  const localPhoto = getWorkoutLocalPhoto(exerciseId);
  if (localPhoto) return localPhoto;

  const photoFile = getPhotoFile(exerciseId);
  const photoGender = gender === 'female' ? 'female' : 'male';
  const remoteUrl = getWorkoutPhotoUrl(photoFile, photoGender);
  return remoteUrl ? { uri: remoteUrl } : null;
}
