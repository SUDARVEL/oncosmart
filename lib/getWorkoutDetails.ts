import type { ImageSource } from "expo-image";

import type { AppAvatar, AppGender, AppLanguage } from "../store/useAppStore";
import type { GuidedSessionExercise } from "./getDay1Session";
import { getSessionExercisesForLevel } from "./getDay1Session";
import { getLevelExercises } from "./getDayExercises";
import { resolveWorkoutSliderPhotoSource } from "./resolveWorkoutPhoto";

export type WorkoutDetail = GuidedSessionExercise & {
  photoSource: ImageSource | null;
};

export function getWorkoutDetailsForLevel(
  level: number,
  language: AppLanguage | null,
  gender: AppGender | null,
  avatar: AppAvatar | null,
): WorkoutDetail[] {
  const exercises = getSessionExercisesForLevel(level);
  const resolvedById = Object.fromEntries(
    getLevelExercises(level, language, gender, avatar).map((exercise) => [
      exercise.id,
      exercise,
    ]),
  );

  return exercises.map((exercise) => {
    const media = resolvedById[exercise.id];
    return {
      ...exercise,
      photoSource:
        resolveWorkoutSliderPhotoSource(exercise.id, gender, avatar) ??
        media?.thumbnail ??
        null,
    };
  });
}
