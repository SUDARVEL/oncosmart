import type { ImageSource } from "expo-image";

import type { AppAvatar, AppGender, AppLanguage } from "../store/useAppStore";
import type { GuidedSessionExercise } from "./getDay1Session";
import { getSessionExercisesForLevel } from "./getDay1Session";
import { getLevelExercises } from "./getDayExercises";
import { resolveWorkoutSliderPhotoSource } from "./resolveWorkoutPhoto";
import { resolveWorkoutMediaGender } from "./workoutGrowthPlaceholders";

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

  const mediaGender = resolveWorkoutMediaGender(gender, avatar);

  return exercises.map((exercise) => {
    const media = resolvedById[exercise.id];
    const sliderPhoto = resolveWorkoutSliderPhotoSource(
      exercise.id,
      gender,
      avatar,
    );
    return {
      ...exercise,
      // Day-1 thumbnails are male landscape stills. Do not use them for a
      // female character when the slider resolver has no same-gender photo.
      photoSource:
        sliderPhoto ??
        (mediaGender === "female" ? null : media?.thumbnail ?? null),
    };
  });
}
