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

type DaySession = {
  day: number;
  level: number;
  exercises: { id: string }[];
};

const sessions = dayExercisesData.days as DaySession[];

export function getLevelWorkouts(level: number, gender: AppGender | null): LevelWorkout[] {
  const session = sessions.find((entry) => entry.level === level);
  if (!session) return [];

  return session.exercises.map((exercise) => ({
    id: exercise.id,
    titleKey: `growth.workouts.items.${exercise.id}.title`,
    descriptionKey: `growth.workouts.items.${exercise.id}.description`,
    photoSource: resolveWorkoutPhotoSource(exercise.id, gender),
  }));
}

export const WORKOUT_LEVELS = [1, 2, 3, 4] as const;
export type WorkoutLevel = (typeof WORKOUT_LEVELS)[number];
