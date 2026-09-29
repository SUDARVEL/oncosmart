import type { ImageSource } from 'expo-image';

import { getDay1Thumbnail } from '../components/exercise/day1Thumbnails';
import dayExercisesData from '../data/day-exercises.json';
import type { AppAvatar, AppGender, AppLanguage } from '../store/useAppStore';
import { useAppStore } from '../store/useAppStore';
import { normalizeCancerTypeSlug } from './cancerPathway';
import { getFigmaRepBadge } from './exerciseRepConfig';
import {
  getPathwayProfileFromStore,
  getSessionExercisesForLevel,
  type GuidedSessionExercise,
} from './getDay1Session';
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
  videoSource: string | null;
  playbackSource: string | null;
  previewPhoto: ImageSource | null;
  previewVideo: string | null;
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
  cancerType: string,
): string {
  return `${level}|${language ?? ''}|${gender ?? ''}|${avatar ?? ''}|${cancerType}`;
}

function repLabelFromGuided(exercise: GuidedSessionExercise): string {
  if (exercise.displayLabel === 'MINS') return `${exercise.displayValue} min`;
  if (exercise.displayLabel === 'SECS') return `${exercise.displayValue} sec`;
  return `x${Number.parseInt(exercise.displayValue, 10) || exercise.repValue}`;
}

function catalogSlugFromPathwayId(exerciseId: string): string | null {
  const match = /-s\d+-(.+)$/.exec(exerciseId);
  return match?.[1] ?? null;
}

function pathwayToResolved(
  exercise: GuidedSessionExercise,
  gender: AppGender | null,
  avatar: AppAvatar | null,
): ResolvedDayExercise {
  const slug = catalogSlugFromPathwayId(exercise.id);
  const catalogEntry = slug ? catalog[slug] : undefined;
  const name = exercise.title ?? catalogEntry?.name ?? 'Exercise';
  const repLabel = repLabelFromGuided(exercise);
  const videoSource = exercise.videoUrl ?? null;
  const previewVideo =
    slug && !slug.includes('stretch') ? getSessionLandscapeVideoUrl(slug, gender, avatar) : null;
  const thumbnail = slug ? getDay1Thumbnail(slug) : null;
  const previewPhoto =
    (slug ? resolveSessionLandscapePhotoSource(slug, gender, avatar) : null) ??
    (slug ? resolveSessionCardPhotoSource(slug, gender, avatar) : null);

  return {
    id: exercise.id,
    name,
    repLabel,
    videos: catalogEntry?.videos ?? {
      'male-en': '',
      'male-ta': '',
      'female-en': '',
      'female-ta': '',
    },
    videoSource,
    playbackSource: videoSource,
    previewPhoto: previewPhoto ?? thumbnail,
    previewVideo,
    thumbnail,
  };
}

export function getLevelSession(level: number): LevelSession | null {
  const profile = getPathwayProfileFromStore();
  const pathway = getSessionExercisesForLevel(level, profile);
  if (pathway.length > 0) {
    return {
      level,
      exercises: pathway.map((entry) => ({
        id: entry.id,
        name: entry.title ?? entry.id,
        repLabel: repLabelFromGuided(entry),
        videos: {
          'male-en': '',
          'male-ta': '',
          'female-en': '',
          'female-ta': '',
        },
      })),
    };
  }

  const program = getLevelExerciseProgram(level);
  if (!program) return null;

  const exercises = program.exerciseIds
    .map((id) => {
      const entry = catalog[id];
      if (!entry) return null;
      const figmaBadge = getFigmaRepBadge(id);
      return figmaBadge ? { ...entry, repLabel: figmaBadge } : entry;
    })
    .filter((entry): entry is CatalogEntry => Boolean(entry));

  return { level, exercises };
}

export function getDaySession(day: number): LevelSession | null {
  return getLevelSession(day);
}

function resolveExplicitExerciseVideo(
  exercise: DayExercise,
  variant: VideoVariant,
  gender: AppGender | null,
  avatar: AppAvatar | null,
  language: AppLanguage | null,
): string | null {
  const portraitUrl = getExercisePortraitVideoUrl(exercise.id, gender, avatar, language);
  if (portraitUrl) return portraitUrl;

  const preferred = exercise.videos[variant]?.trim();
  if (preferred) return resolveVideoUrl(preferred);

  if (variant === 'female-ta' || variant === 'male-ta') {
    const enUrl = getExercisePortraitVideoUrl(exercise.id, gender, avatar, 'en');
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
  const cancerSlug = normalizeCancerTypeSlug(useAppStore.getState().cancerType) ?? '';
  const cacheKey = exercisesCacheKey(level, language, gender, avatar, cancerSlug);
  const cached = levelExercisesCache.get(cacheKey);
  if (cached) return cached;

  const profile = getPathwayProfileFromStore();
  const pathway = getSessionExercisesForLevel(level, profile);
  if (pathway.length > 0) {
    const resolved = pathway.map((entry) => pathwayToResolved(entry, gender, avatar));
    levelExercisesCache.set(cacheKey, resolved);
    return resolved;
  }

  const session = getLevelSession(level);
  if (!session) return [];

  const variant = getVideoVariant(language, gender, avatar);

  const resolved = session.exercises.map((exercise) => {
    const videoSource = resolveExplicitExerciseVideo(
      exercise,
      variant,
      gender,
      avatar,
      language,
    );
    const slug = catalogSlugFromPathwayId(exercise.id) ?? exercise.id;
    const previewVideo = slug.includes('stretch')
      ? null
      : getSessionLandscapeVideoUrl(slug, gender, avatar);
    const thumbnail = getDay1Thumbnail(slug);
    const previewPhoto =
      resolveSessionLandscapePhotoSource(slug, gender, avatar) ??
      resolveSessionCardPhotoSource(slug, gender, avatar);

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

export function clearLevelExercisesCache(): void {
  levelExercisesCache.clear();
}

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
  const profile = getPathwayProfileFromStore();
  const pathwayEntry = getSessionExercisesForLevel(level, profile).find(
    (entry) => entry.id === exerciseId,
  );
  if (pathwayEntry?.videoUrl) {
    const sanitized = sanitizePublicVideoUrl(pathwayEntry.videoUrl);
    return isValidGuidedPlaybackUrl(sanitized) ? sanitized : pathwayEntry.videoUrl;
  }

  const session = getLevelSession(level);
  if (!session) return null;

  const exercise = session.exercises.find((entry) => entry.id === exerciseId);
  if (!exercise) return null;

  const variant = getVideoVariant(language, gender, avatar);
  const explicit = resolveExplicitExerciseVideo(exercise, variant, gender, avatar, language);
  const resolved = resolveExercisePlaybackUrl(explicit, exercise.name, variant);
  if (!resolved) return null;

  const sanitized = sanitizePublicVideoUrl(resolved);
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
