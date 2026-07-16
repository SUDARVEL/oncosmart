import type { ImageSource } from 'expo-image';

import type { AppAvatar, AppGender } from '../store/useAppStore';
import { getWorkoutPhotoUrl } from './getWorkoutPhotoUrl';
import { getWorkoutLocalPhoto } from './workoutLocalPhotos';
import { getWorkoutSliderPhotoUrl } from './workoutSliderPhotoUrls';
import { isFemaleMediaTrack } from './exerciseMediaUrls';
import { resolveSessionLandscapePhotoSource } from './sessionLandscapePhotos';
import workoutPhotos from '../data/workout-photos.json';

function getPhotoFile(exerciseId: string): string | null {
  const track = workoutPhotos.male as Record<string, string | null>;
  return track[exerciseId] ?? null;
}

/**
 * Session list card preview for Figma landscape cards.
 * Prefer gender-matched Landscape Photos, then Slider Photos, then fallbacks.
 */
export function resolveSessionCardPhotoSource(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): ImageSource | null {
  const landscape = resolveSessionLandscapePhotoSource(exerciseId, gender, avatar);
  if (landscape) return landscape;

  const mediaGender: AppGender | null = isFemaleMediaTrack(gender, avatar)
    ? 'female'
    : gender;
  const sliderUrl = getWorkoutSliderPhotoUrl(exerciseId, mediaGender);
  if (sliderUrl) return { uri: sliderUrl };

  if (isFemaleMediaTrack(gender, avatar)) {
    // Avoid male bundled art when the selected avatar is female.
    const photoFile = getPhotoFile(exerciseId);
    const remoteUrl = getWorkoutPhotoUrl(photoFile, 'female');
    return remoteUrl ? { uri: remoteUrl } : null;
  }

  const localPhoto = getWorkoutLocalPhoto(exerciseId);
  if (localPhoto) return localPhoto;

  const photoFile = getPhotoFile(exerciseId);
  const remoteUrl = getWorkoutPhotoUrl(photoFile, 'male');
  return remoteUrl ? { uri: remoteUrl } : null;
}
