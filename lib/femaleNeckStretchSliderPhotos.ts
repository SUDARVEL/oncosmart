import type { ImageSource } from 'expo-image';

import type { AppAvatar, AppGender } from '../store/useAppStore';
import { exerciseSlugFromId } from './phase2PlaceholderMedia';
import { resolveWorkoutMediaGender } from './workoutGrowthPlaceholders';

/**
 * Placeholders Oncomsart Phase 2 has no female neck-stretch portrait.
 * These frames are the female 9:16 pathway clips (pink shirt), so the
 * Exercise Info slider does not fall through to the bundled male still.
 */
const FEMALE_NECK_STRETCH_SLIDER: Partial<Record<string, ImageSource>> = {
  'neck-stretch-left': require('../assets/workout-slider/female-neck-stretch-left.jpg'),
  'neck-stretch-right': require('../assets/workout-slider/female-neck-stretch-right.jpg'),
};

export function getFemaleNeckStretchSliderPhoto(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): ImageSource | null {
  if (resolveWorkoutMediaGender(gender, avatar) !== 'female') return null;
  const slug = exerciseSlugFromId(exerciseId);
  return (
    FEMALE_NECK_STRETCH_SLIDER[slug] ??
    FEMALE_NECK_STRETCH_SLIDER[`${slug}-left`] ??
    null
  );
}
