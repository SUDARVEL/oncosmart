import type { ImageSource } from 'expo-image';

import dayExercisesData from '../data/day-exercises.json';
import type { AppGender } from '../store/useAppStore';
import { resolveWorkoutPhotoSource } from './resolveWorkoutPhoto';

export type LevelWorkout = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  photoSource: ImageSource | null;
};

type LevelProgram = {
  level: number;
  exerciseIds: string[];
};

const levelPrograms = (dayExercisesData as { levels: LevelProgram[] }).levels;

export function getLevelWorkouts(level: number, gender: AppGender | null): LevelWorkout[] {
  const program = levelPrograms.find((entry) => entry.level === level);
  if (!program) return [];

  return program.exerciseIds.map((id) => ({
    id,
    titleKey: `growth.workouts.items.${id}.title`,
    descriptionKey: `growth.workouts.items.${id}.description`,
    photoSource: resolveWorkoutPhotoSource(id, gender),
  }));
}

export const WORKOUT_LEVELS = [1, 2, 3, 4] as const;
export type WorkoutLevel = (typeof WORKOUT_LEVELS)[number];
