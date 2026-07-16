import type { ImageSource } from 'expo-image';

import { getDay1Thumbnail } from '../components/exercise/day1Thumbnails';
import dayExercisesData from '../data/day-exercises.json';
import type { AppAvatar, AppGender, AppLanguage } from '../store/useAppStore';
import { getLevelExerciseProgram } from './levelExercisePrograms';
import { getVideoVariant, type VideoVariant } from './getExerciseVideo';
import {
  getExercisePortraitVideoUrl,
  getSessionLandscapeVideoUrl,
} from './exerciseMediaUrls';
import {
  guessSupabaseExerciseVideoUrl,
  resolveExercisePlaybackUrl,
} from './resolveExercisePreview';
import { resolveSessionCardPhotoSource } from './resolveSessionCardPhoto';
import { resolveSessionLandscapePhotoSource } from './sessionLandscapePhotos';
import { resolveVideoUrl } from './resolveVideoUrl';
import { isValidGuidedPlaybackUrl, sanitizePublicVideoUrl } from './videoStoragePolicy';

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
  gender: AppGender | null,
  avatar: AppAvatar | null,
): string | null {
  if (variant === 'male-en' || variant === 'female-en' || variant === 'female-ta') {
    const portraitUrl = getExercisePortraitVideoUrl(exercise.id, gender, avatar);
    if (portraitUrl) return portraitUrl;
  }

  const preferred = exercise.videos[variant]?.trim();
  if (preferred) return resolveVideoUrl(preferred);

  // Female Tamil → English female portrait when Tamil files are absent.
  if (variant === 'female-ta') {
    const enUrl = getExercisePortraitVideoUrl(exercise.id, 'female', 'female');
    if (enUrl) return enUrl;
  }

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
    const videoSource = resolveExplicitExerciseVideo(exercise, variant, gender, avatar);
    const previewVideo = exercise.id.includes('stretch')
      ? null
      : getSessionLandscapeVideoUrl(exercise.id, gender, avatar);
    const thumbnail = getDay1Thumbnail(exercise.id);
    const previewPhoto =
      resolveSessionLandscapePhotoSource(exercise.id, gender, avatar) ??
      resolveSessionCardPhotoSource(exercise.id, gender, avatar);

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
  const explicit = resolveExplicitExerciseVideo(exercise, variant, gender, avatar);
  const resolved = resolveExercisePlaybackUrl(explicit, exercise.name, variant);
  if (!resolved) return null;

  const sanitized = sanitizePublicVideoUrl(resolved);
  // Guided / single-exercise playback must never use short landscape previews.
  return isValidGuidedPlaybackUrl(sanitized) ? sanitized : null;
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
