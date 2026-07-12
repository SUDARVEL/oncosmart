import type { ImageSource } from 'expo-image';

import type { AppGender } from '../store/useAppStore';
import { getWorkoutPhotoUrl } from './getWorkoutPhotoUrl';
import { getWorkoutLocalPhoto } from './workoutLocalPhotos';
import { getWorkoutSliderPhotoUrl } from './workoutSliderPhotoUrls';
import workoutPhotos from '../data/workout-photos.json';

function getPhotoFile(exerciseId: string): string | null {
  const track = workoutPhotos.male as Record<string, string | null>;
  return track[exerciseId] ?? null;
}

/**
 * Session list card preview — prefer sharp Male Slider Photos.
 * Avoid Day-1 Figma thumbs (often poorly cropped in landscape frames).
 */
export function resolveSessionCardPhotoSource(
  exerciseId: string,
  gender: AppGender | null,
): ImageSource | null {
  const sliderUrl = getWorkoutSliderPhotoUrl(exerciseId, gender);
  if (sliderUrl) return { uri: sliderUrl };

  const localPhoto = getWorkoutLocalPhoto(exerciseId);
  if (localPhoto) return localPhoto;

  const photoFile = getPhotoFile(exerciseId);
  const photoGender = gender === 'female' ? 'female' : 'male';
  const remoteUrl = getWorkoutPhotoUrl(photoFile, photoGender);
  return remoteUrl ? { uri: remoteUrl } : null;
}
