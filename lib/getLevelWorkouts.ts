import type { ImageSource } from "expo-image";

import type { AppAvatar, AppGender } from "../store/useAppStore";
import { getLevelExerciseProgram } from "./levelExercisePrograms";
import { resolveWorkoutPhotoSource } from "./resolveWorkoutPhoto";

export type LevelWorkout = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  photoSource: ImageSource | null;
  mediaGender: "male" | "female";
};

export function getLevelWorkouts(
  level: number,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): LevelWorkout[] {
  const program = getLevelExerciseProgram(level);
  if (!program) return [];

  return program.exerciseIds.map((id) => {
    const photoSource = resolveWorkoutPhotoSource(id, gender, avatar);
    const mediaGender =
      avatar === "female" || gender === "female" ? "female" : "male";
    return {
      id,
      titleKey: `growth.workouts.items.${id}.title`,
      descriptionKey: `growth.workouts.items.${id}.description`,
      photoSource,
      mediaGender,
    };
  });
}

export const WORKOUT_LEVELS = [1, 2, 3, 4] as const;
export type WorkoutLevel = (typeof WORKOUT_LEVELS)[number];
