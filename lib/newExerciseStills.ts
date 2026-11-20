import type { ImageSource } from 'expo-image';

import type { AppAvatar, AppGender } from '../store/useAppStore';
import { exerciseSlugFromId } from './phase2PlaceholderMedia';

/**
 * Portrait frames from the Newly added videos.
 * Same 9:16 studio framing as the older placeholders, so the slider
 * can contain the whole figure and the circle can cover it.
 */
const FEMALE_STILLS: Record<string, ImageSource> = {
  'incentive-spirometer': require('../assets/workouts/stills/female-incentive-spirometer.jpg'),
  'shoulder-retraction': require('../assets/workouts/stills/female-shoulder-retraction.jpg'),
  'shoulder-external-rotation': require('../assets/workouts/stills/female-shoulder-external-rotation.jpg'),
  'heel-slides': require('../assets/workouts/stills/female-heel-slides.jpg'),
  'pelvic-bridge': require('../assets/workouts/stills/female-pelvic-bridge.jpg'),
  'unilateral-bridge': require('../assets/workouts/stills/female-unilateral-bridge.jpg'),
  'neck-nodding': require('../assets/workouts/stills/female-neck-nodding.jpg'),
  'neck-rotation': require('../assets/workouts/stills/female-neck-rotation.jpg'),
  'neck-side-flexion': require('../assets/workouts/stills/female-neck-side-flexion.jpg'),
  'neck-flexion-extension': require('../assets/workouts/stills/female-neck-flexion-extension.jpg'),
  'hamstring-stretch': require('../assets/workouts/stills/female-hamstring-stretch.jpg'),
};

const MALE_STILLS: Record<string, ImageSource> = {
  'incentive-spirometer': require('../assets/workouts/stills/male-incentive-spirometer.jpg'),
  'shoulder-retraction': require('../assets/workouts/stills/male-shoulder-retraction.jpg'),
  'shoulder-external-rotation': require('../assets/workouts/stills/male-shoulder-external-rotation.jpg'),
  'heel-slides': require('../assets/workouts/stills/male-heel-slides.jpg'),
  'pelvic-bridge': require('../assets/workouts/stills/male-pelvic-bridge.jpg'),
  'unilateral-bridge': require('../assets/workouts/stills/male-unilateral-bridge.jpg'),
  'neck-nodding': require('../assets/workouts/stills/male-neck-nodding.jpg'),
  'neck-rotation': require('../assets/workouts/stills/male-neck-rotation.jpg'),
  'neck-side-flexion': require('../assets/workouts/stills/male-neck-side-flexion.jpg'),
  'neck-flexion-extension': require('../assets/workouts/stills/male-neck-flexion-extension.jpg'),
  'hamstring-stretch': require('../assets/workouts/stills/male-hamstring-stretch.jpg'),
};

/**
 * Wide session-card frames (257×112). The portrait clips are too tall for
 * that strip, so these crops keep the action inside the card.
 */
const FEMALE_CARD_STILLS: Record<string, ImageSource> = {
  'incentive-spirometer': require('../assets/workouts/stills/cards/female-incentive-spirometer.jpg'),
  'shoulder-retraction': require('../assets/workouts/stills/cards/female-shoulder-retraction.jpg'),
  'unilateral-bridge': require('../assets/workouts/stills/cards/female-unilateral-bridge.jpg'),
};

const MALE_CARD_STILLS: Record<string, ImageSource> = {
  'incentive-spirometer': require('../assets/workouts/stills/cards/male-incentive-spirometer.jpg'),
  'shoulder-retraction': require('../assets/workouts/stills/cards/male-shoulder-retraction.jpg'),
  'unilateral-bridge': require('../assets/workouts/stills/cards/male-unilateral-bridge.jpg'),
};

/** These replaced an older still, so the new frame must win. */
const REPLACES_OLDER_STILL = new Set([
  'hamstring-stretch',
  'neck-flexion-extension',
]);

function isFemale(gender: AppGender | null, avatar: AppAvatar | null): boolean {
  return avatar ? avatar === 'female' : gender === 'female';
}

export function newExerciseStillBase(exerciseId: string): string {
  return exerciseSlugFromId(exerciseId).replace(/-(left|right)$/i, '');
}

export function getNewExerciseStill(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): ImageSource | null {
  const base = newExerciseStillBase(exerciseId);
  const map = isFemale(gender, avatar) ? FEMALE_STILLS : MALE_STILLS;
  return map[base] ?? null;
}

export function getNewExerciseCardStill(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): ImageSource | null {
  const base = newExerciseStillBase(exerciseId);
  const map = isFemale(gender, avatar) ? FEMALE_CARD_STILLS : MALE_CARD_STILLS;
  return map[base] ?? null;
}

export function newExerciseStillReplacesOlder(exerciseId: string): boolean {
  return REPLACES_OLDER_STILL.has(newExerciseStillBase(exerciseId));
}
