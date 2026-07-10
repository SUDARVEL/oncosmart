import type { ImageSource } from 'expo-image';

import { getDay1Thumbnail } from '../components/exercise/day1Thumbnails';
import type { AppGender } from '../store/useAppStore';
import { getWorkoutPhotoUrl } from './getWorkoutPhotoUrl';
import { getWorkoutSliderPhotoUrl } from './workoutSliderPhotoUrls';
import { getWorkoutLocalPhoto } from './workoutLocalPhotos';
import workoutPhotos from '../data/workout-photos.json';

function getPhotoFile(exerciseId: string): string | null {
  const track = workoutPhotos.male as Record<string, string | null>;
  return track[exerciseId] ?? null;
}

/**
 * Picks the best available workout photo:
 * 1. Bundled workout asset (user-provided / fixed local PNG)
 * 2. Bundled Day 1 Figma thumbnail (stretches)
 * 3. Supabase Male photos URL
 */
export function resolveWorkoutPhotoSource(
  exerciseId: string,
  gender: AppGender | null,
): ImageSource | null {
  const localPhoto = getWorkoutLocalPhoto(exerciseId);
  if (localPhoto) return localPhoto;

  const day1Photo = getDay1Thumbnail(exerciseId);
  if (day1Photo) return day1Photo;

  const photoFile = getPhotoFile(exerciseId);
  const photoGender = gender === 'female' ? 'female' : 'male';
  const remoteUrl = getWorkoutPhotoUrl(photoFile, photoGender);

  return remoteUrl ? { uri: remoteUrl } : null;
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
