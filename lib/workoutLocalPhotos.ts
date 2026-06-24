import type { ImageSource } from 'expo-image';

/** Bundled workout photos used when Supabase does not have the asset yet. */
export const WORKOUT_LOCAL_PHOTOS: Partial<Record<string, ImageSource>> = {
  'diaphragmatic-breathing': require('../assets/workouts/diaphragmatic-breathing.png'),
  'triceps-stretch-right': require('../assets/workouts/triceps-stretch-right.png'),
  'triceps-stretch-left': require('../assets/workouts/triceps-stretch-left.png'),
  'neck-stretch-left': require('../assets/workouts/neck-stretch-left.png'),
};

export function getWorkoutLocalPhoto(exerciseId: string): ImageSource | null {
  return WORKOUT_LOCAL_PHOTOS[exerciseId] ?? null;
}
