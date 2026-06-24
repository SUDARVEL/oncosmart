import type { ImageSource } from 'expo-image';

import { getDay1Thumbnail } from '../components/exercise/day1Thumbnails';
import dayExercisesData from '../data/day-exercises.json';
import type { AppAvatar, AppGender, AppLanguage } from '../store/useAppStore';
import { getVideoVariant, type VideoVariant } from './getExerciseVideo';
import {
  getDayPreviewFallback,
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

export type DaySession = {
  day: number;
  level: number;
  exercises: DayExercise[];
};

export type ResolvedDayExercise = DayExercise & {
  /** Explicit uploaded video URL for this exercise. */
  videoSource: string | null;
  /** URL used when opening the full player (explicit or Supabase guess). */
  playbackSource: string | null;
  /** Static Figma thumbnail when no video is uploaded yet. */
  thumbnail: ImageSource | null;
  /** Day-level landscape video used as a visual fallback preview. */
  previewFallbackVideo: string | null;
};

const sessions = dayExercisesData.days as DaySession[];

export function getDaySession(day: number): DaySession | null {
  return sessions.find((entry) => entry.day === day) ?? null;
}

function resolveExplicitExerciseVideo(
  exercise: DayExercise,
  variant: VideoVariant,
): string | null {
  const preferred = exercise.videos[variant]?.trim();
  if (preferred) return resolveVideoUrl(preferred);

  const fallback = Object.values(exercise.videos).find((url) => url.trim().length > 0);
  return fallback ? resolveVideoUrl(fallback) : null;
}

export function getDayExercises(
  day: number,
  language: AppLanguage | null,
  gender: AppGender | null,
  avatar: AppAvatar | null,
): ResolvedDayExercise[] {
  const session = getDaySession(day);
  if (!session) return [];

  const variant = getVideoVariant(language, gender, avatar);
  const dayPreviewFallback = getDayPreviewFallback(day, language, gender, avatar);

  return session.exercises.map((exercise) => {
    const videoSource = resolveExplicitExerciseVideo(exercise, variant);
    const thumbnail = day === 1 ? getDay1Thumbnail(exercise.id) : null;

    return {
      ...exercise,
      videoSource,
      playbackSource: resolveExercisePlaybackUrl(videoSource, exercise.name, variant),
      thumbnail,
      previewFallbackVideo: videoSource || thumbnail ? null : dayPreviewFallback,
    };
  });
}

export function getSessionExerciseVideoSource(
  day: number,
  exerciseId: string,
  language: AppLanguage | null,
  gender: AppGender | null,
  avatar: AppAvatar | null,
): string | null {
  const session = getDaySession(day);
  if (!session) return null;

  const exercise = session.exercises.find((entry) => entry.id === exerciseId);
  if (!exercise) return null;

  const variant = getVideoVariant(language, gender, avatar);
  const explicit = resolveExplicitExerciseVideo(exercise, variant);
  return resolveExercisePlaybackUrl(explicit, exercise.name, variant);
}

export function getSessionExerciseName(day: number, exerciseId: string): string | null {
  const session = getDaySession(day);
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
