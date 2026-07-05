import type { ImageSource } from 'expo-image';

import { getDay1Thumbnail } from '../components/exercise/day1Thumbnails';
import dayExercisesData from '../data/day-exercises.json';
import type { AppAvatar, AppGender, AppLanguage } from '../store/useAppStore';
import { getVideoVariant, type VideoVariant } from './getExerciseVideo';
import { getPortraitVideoPath } from './exercisePortraitVideos';
import { PLACEHOLDER_PREVIEW_VIDEO } from './placeholderVideo';
import {
  guessSupabaseExerciseVideoUrl,
  resolveExercisePlaybackUrl,
} from './resolveExercisePreview';
import { resolveVideoUrl } from './resolveVideoUrl';

export type DayExercise = {
  id: string;
  name: string;
  repLabel: string;
  videos: Record<VideoVariant, string>;
};

export type LevelSession = {
  level: number;
  exercises: DayExercise[];
};

export type ResolvedDayExercise = DayExercise & {
  videoSource: string | null;
  playbackSource: string | null;
  thumbnail: ImageSource | null;
  previewFallbackVideo: string | null;
};

type CatalogEntry = DayExercise;
type LevelProgram = { level: number; exerciseIds: string[] };

const catalog = (dayExercisesData as { catalog: Record<string, CatalogEntry> }).catalog;
const levelPrograms = (dayExercisesData as { levels: LevelProgram[] }).levels;

export function getLevelSession(level: number): LevelSession | null {
  const program = levelPrograms.find((entry) => entry.level === level);
  if (!program) return null;

  const exercises = program.exerciseIds
    .map((id) => catalog[id])
    .filter((entry): entry is CatalogEntry => Boolean(entry));

  return { level, exercises };
}

/** @deprecated Use getLevelSession(level) */
export function getDaySession(day: number): LevelSession | null {
  return getLevelSession(day);
}

function resolveExplicitExerciseVideo(
  exercise: DayExercise,
  variant: VideoVariant,
): string | null {
  if (variant === 'male-en') {
    const portraitPath = getPortraitVideoPath(exercise.id);
    if (portraitPath) return resolveVideoUrl(portraitPath);
  }

  const preferred = exercise.videos[variant]?.trim();
  if (preferred) return resolveVideoUrl(preferred);

  const fallback = Object.values(exercise.videos).find((url) => url.trim().length > 0);
  return fallback ? resolveVideoUrl(fallback) : null;
}

export function getLevelExercises(
  level: number,
  language: AppLanguage | null,
  gender: AppGender | null,
  avatar: AppAvatar | null,
): ResolvedDayExercise[] {
  const session = getLevelSession(level);
  if (!session) return [];

  const variant = getVideoVariant(language, gender, avatar);

  return session.exercises.map((exercise) => {
    const videoSource = resolveExplicitExerciseVideo(exercise, variant);
    const thumbnail = getDay1Thumbnail(exercise.id);

    return {
      ...exercise,
      videoSource,
      playbackSource: resolveExercisePlaybackUrl(videoSource, exercise.name, variant),
      thumbnail,
      previewFallbackVideo: videoSource || thumbnail ? null : PLACEHOLDER_PREVIEW_VIDEO,
    };
  });
}

/** @deprecated Use getLevelExercises(level, ...) */
export function getDayExercises(
  day: number,
  language: AppLanguage | null,
  gender: AppGender | null,
  avatar: AppAvatar | null,
): ResolvedDayExercise[] {
  return getLevelExercises(day, language, gender, avatar);
}

export function getSessionExerciseVideoSource(
  level: number,
  exerciseId: string,
  language: AppLanguage | null,
  gender: AppGender | null,
  avatar: AppAvatar | null,
): string | null {
  const session = getLevelSession(level);
  if (!session) return null;

  const exercise = session.exercises.find((entry) => entry.id === exerciseId);
  if (!exercise) return null;

  const variant = getVideoVariant(language, gender, avatar);
  const explicit = resolveExplicitExerciseVideo(exercise, variant);
  return resolveExercisePlaybackUrl(explicit, exercise.name, variant);
}

export function getSessionExerciseName(level: number, exerciseId: string): string | null {
  const session = getLevelSession(level);
  const exercise = session?.exercises.find((entry) => entry.id === exerciseId);
  return exercise?.name ?? null;
}

export function getGuessedExerciseVideoUrl(
  exerciseName: string,
  language: AppLanguage | null,
  gender: AppGender | null,
  avatar: AppAvatar | null,
): string {
  const variant = getVideoVariant(language, gender, avatar);
  return guessSupabaseExerciseVideoUrl(exerciseName, variant);
}
