import { useAppStore } from '../store/useAppStore';
import { normalizeCancerTypeSlug, type PathwayProfile } from './cancerPathway';
import { EXERCISE_REP_CONFIG } from './exerciseRepConfig';
import { getLevelExerciseProgram } from './levelExercisePrograms';
import {
  getPathwaySessionExercises,
  getPathwaySessionRestSeconds,
  ensurePathwayVideoPathsLoaded,
} from './pathwayVideoIndex';
import { TOTAL_LEVELS } from './programProgress';

export type SessionRepType = 'reps' | 'duration';
export type SessionDisplayLabel = 'REPS' | 'MINS' | 'SECS';

export type GuidedSessionExercise = {
  id: string;
  repType: SessionRepType;
  repValue: number;
  displayValue: string;
  displayLabel: SessionDisplayLabel;
  /** Storage object path (pathway) or legacy portrait relative path. */
  portraitVideo: string;
  /** Full public URL when using pathway storage videos. */
  videoUrl?: string;
  storageObjectPath?: string;
  /** Pathway copy — when set, player uses these instead of i18n catalog. */
  title?: string;
  description?: string;
};

export type GuidedSession = {
  level: number;
  restSeconds: number;
  exercises: GuidedSessionExercise[];
};

const REST_SECONDS = 20;

const pathwaySessionCache = new Map<string, GuidedSessionExercise[]>();
let pathwaySessionsRevision = 0;
const pathwaySessionListeners = new Set<() => void>();

export function getPathwaySessionsRevision(): number {
  return pathwaySessionsRevision;
}

export function subscribePathwaySessions(listener: () => void): () => void {
  pathwaySessionListeners.add(listener);
  return () => {
    pathwaySessionListeners.delete(listener);
  };
}

function notifyPathwaySessions(): void {
  pathwaySessionsRevision += 1;
  for (const listener of pathwaySessionListeners) listener();
}

function pathwayCacheKey(profile: PathwayProfile, level: number): string {
  const root = `${profile.gender ?? ''}|${profile.avatar ?? ''}|${profile.language ?? ''}|${profile.cancerType}`;
  return `${root}|L${level}`;
}

export function getPathwayProfileFromStore(): PathwayProfile | null {
  const state = useAppStore.getState();
  const cancerType = normalizeCancerTypeSlug(state.cancerType);
  if (!cancerType) return null;
  return {
    gender: state.gender,
    avatar: state.avatar,
    language: state.language,
    cancerType,
  };
}

/** Load pathway index + build sessions for all levels (call before exercise UI). */
export async function warmPathwaySessionsForProfile(
  profile: PathwayProfile,
): Promise<void> {
  await ensurePathwayVideoPathsLoaded();
  pathwaySessionCache.clear();

  await Promise.all(
    Array.from({ length: TOTAL_LEVELS }, async (_, index) => {
      const level = index + 1;
      const exercises = await getPathwaySessionExercises(profile, level);
      pathwaySessionCache.set(pathwayCacheKey(profile, level), exercises);
    }),
  );
  notifyPathwaySessions();
}

export async function warmPathwaySessionsFromStore(): Promise<boolean> {
  const profile = getPathwayProfileFromStore();
  if (!profile) return false;
  await warmPathwaySessionsForProfile(profile);
  return true;
}

function getPathwayExercises(level: number, profile: PathwayProfile): GuidedSessionExercise[] {
  return pathwaySessionCache.get(pathwayCacheKey(profile, level)) ?? [];
}

function buildLegacyExercise(id: string): GuidedSessionExercise | null {
  const config = EXERCISE_REP_CONFIG[id];
  if (!config) return null;

  return {
    id,
    repType: config.repType,
    repValue: config.repValue,
    displayValue: config.displayValue,
    displayLabel: config.displayLabel,
    portraitVideo: config.portraitVideo ?? '',
  };
}

function getLegacySessionExercises(level: number): GuidedSessionExercise[] {
  const program = getLevelExerciseProgram(level);
  if (!program) return [];

  return program.exerciseIds
    .map((id) => buildLegacyExercise(id))
    .filter((entry): entry is GuidedSessionExercise => entry != null);
}

function resolveExercisesForLevel(level: number, profile: PathwayProfile | null): GuidedSessionExercise[] {
  if (profile?.cancerType) {
    // Cancer pathways follow the ONCOSMART tables. Do not substitute the
    // generic program while those sessions are still loading.
    return getPathwayExercises(level, profile);
  }
  return getLegacySessionExercises(level);
}

export function hasGuidedSession(level: number, profile: PathwayProfile | null = getPathwayProfileFromStore()): boolean {
  return resolveExercisesForLevel(level, profile).length > 0;
}

export function getSessionForLevel(
  level: number,
  profile: PathwayProfile | null = getPathwayProfileFromStore(),
): GuidedSession | null {
  const exercises = resolveExercisesForLevel(level, profile);
  if (!exercises.length) return null;
  const restSeconds = profile?.cancerType ? getPathwaySessionRestSeconds() : REST_SECONDS;
  return { level, restSeconds, exercises };
}

export function getSessionExercisesForLevel(
  level: number,
  profile: PathwayProfile | null = getPathwayProfileFromStore(),
): GuidedSessionExercise[] {
  return resolveExercisesForLevel(level, profile);
}

export function getSessionExerciseForLevel(
  level: number,
  index: number,
  profile: PathwayProfile | null = getPathwayProfileFromStore(),
): GuidedSessionExercise | null {
  return getSessionExercisesForLevel(level, profile)[index] ?? null;
}

export function getSessionRestSecondsForLevel(
  level: number,
  profile: PathwayProfile | null = getPathwayProfileFromStore(),
): number {
  if (profile?.cancerType) return getPathwaySessionRestSeconds();
  return REST_SECONDS;
}

export function isSessionCompleteForLevel(
  level: number,
  index: number,
  profile: PathwayProfile | null = getPathwayProfileFromStore(),
): boolean {
  return index >= getSessionExercisesForLevel(level, profile).length;
}

export function isExerciseInLevel(
  level: number,
  exerciseId: string,
  profile: PathwayProfile | null = getPathwayProfileFromStore(),
): boolean {
  return getSessionExercisesForLevel(level, profile).some((entry) => entry.id === exerciseId);
}

// Backward-compatible Day 1 aliases
export type Day1SessionExercise = GuidedSessionExercise;
export type Day1Session = GuidedSession;

export function getDay1Session(): Day1Session | null {
  return getSessionForLevel(1);
}

export function getDay1SessionExercises(): Day1SessionExercise[] {
  return getSessionExercisesForLevel(1);
}

export function getDay1SessionExercise(index: number): Day1SessionExercise | null {
  return getSessionExerciseForLevel(1, index);
}

export function getDay1RestSeconds(): number {
  return getSessionRestSecondsForLevel(1);
}

export function isDay1SessionComplete(index: number): boolean {
  return isSessionCompleteForLevel(1, index);
}

export const getSessionForDay = getSessionForLevel;
export const getSessionExercisesForDay = getSessionExercisesForLevel;
export const getSessionExerciseForDay = getSessionExerciseForLevel;
export const getSessionRestSecondsForDay = getSessionRestSecondsForLevel;
export const isSessionCompleteForDay = isSessionCompleteForLevel;
