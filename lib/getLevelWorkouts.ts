import type { ImageSource } from "expo-image";

import type { AppAvatar, AppGender } from "../store/useAppStore";
import { getSessionExercisesForLevel } from "./getDay1Session";
import { getLevelExerciseProgram } from "./levelExercisePrograms";
import { resolveWorkoutPhotoSource } from "./resolveWorkoutPhoto";

export type LevelWorkout = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  /** Pathway copy — shown instead of i18n keys when set. */
  title?: string;
  description?: string;
  photoSource: ImageSource | null;
  mediaGender: "male" | "female";
};

function catalogSlugFromPathwayId(exerciseId: string): string | null {
  const match = /-s\d+-(.+)$/.exec(exerciseId);
  return match?.[1] ?? null;
}

export function getLevelWorkouts(
  level: number,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): LevelWorkout[] {
  const mediaGender =
    avatar === "female" || gender === "female" ? "female" : "male";

  const pathway = getSessionExercisesForLevel(level);
  if (pathway.length > 0) {
    return pathway.map((entry) => {
      const slug = catalogSlugFromPathwayId(entry.id) ?? entry.id;
      const photoSource = resolveWorkoutPhotoSource(slug, gender, avatar);
      return {
        id: entry.id,
        titleKey: "",
        descriptionKey: "",
        title: entry.title,
        description: entry.description,
        photoSource,
        mediaGender,
      };
    });
  }

  const program = getLevelExerciseProgram(level);
  if (!program) return [];

  return program.exerciseIds.map((id) => {
    const photoSource = resolveWorkoutPhotoSource(id, gender, avatar);
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
