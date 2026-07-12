import type { ImageSource } from 'expo-image';

import { getDay1Thumbnail } from '../components/exercise/day1Thumbnails';
import dayExercisesData from '../data/day-exercises.json';
import type { AppAvatar, AppGender, AppLanguage } from '../store/useAppStore';
import { getLevelExerciseProgram } from './levelExercisePrograms';
import { getVideoVariant, type VideoVariant } from './getExerciseVideo';
import { getPortraitVideoPath } from './exercisePortraitVideos';
import {
  guessSupabaseExerciseVideoUrl,
  resolveExercisePlaybackUrl,
} from './resolveExercisePreview';
import { resolveSessionCardPhotoSource } from './resolveSessionCardPhoto';
import { resolveSessionCardFallbackLandscapePhotoSource } from './sessionLandscapePhotos';
import { getSessionLandscapeVideoUrl } from './sessionLandscapeVideos';
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
  /** Resolved playback URL — only fetch during guided session or single-exercise preview. */
  videoSource: string | null;
  playbackSource: string | null;
  /** Static preview for session list cards (used when no landscape loop video). */
  previewPhoto: ImageSource | null;
  /** Muted looping landscape clip for session list cards (GIF-like). */
  previewVideo: string | null;
  /** @deprecated Use previewPhoto */
  thumbnail: ImageSource | null;
};

type CatalogEntry = DayExercise;

const catalog = (dayExercisesData as { catalog: Record<string, CatalogEntry> }).catalog;

const levelExercisesCache = new Map<string, ResolvedDayExercise[]>();

function exercisesCacheKey(
  level: number,
  language: AppLanguage | null,
  gender: AppGender | null,
  avatar: AppAvatar | null,
): string {
  return `${level}|${language ?? ''}|${gender ?? ''}|${avatar ?? ''}`;
}

export function getLevelSession(level: number): LevelSession | null {
  const program = getLevelExerciseProgram(level);
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
  const cacheKey = exercisesCacheKey(level, language, gender, avatar);
  const cached = levelExercisesCache.get(cacheKey);
  if (cached) return cached;

  const session = getLevelSession(level);
  if (!session) return [];

  const variant = getVideoVariant(language, gender, avatar);

  const resolved = session.exercises.map((exercise) => {
    const videoSource = resolveExplicitExerciseVideo(exercise, variant);
    const previewVideo = exercise.id.includes('stretch')
      ? null
      : getSessionLandscapeVideoUrl(exercise.id, gender);
    const thumbnail = getDay1Thumbnail(exercise.id);
    // No looping video → Male Landscape Photos (fits 257×112 on every level).
    const previewPhoto = previewVideo
      ? resolveSessionCardPhotoSource(exercise.id, gender)
      : resolveSessionCardFallbackLandscapePhotoSource(exercise.id, gender) ??
        resolveSessionCardPhotoSource(exercise.id, gender);

    return {
      ...exercise,
      videoSource,
      playbackSource: resolveExercisePlaybackUrl(videoSource, exercise.name, variant),
      previewPhoto: previewPhoto ?? thumbnail,
      previewVideo,
      thumbnail,
    };
  });

  levelExercisesCache.set(cacheKey, resolved);
  return resolved;
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
