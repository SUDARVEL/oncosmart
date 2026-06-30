import dayExercisesData from '../data/day-exercises.json';
import { EXERCISE_REP_CONFIG } from './exerciseRepConfig';
import { TOTAL_LEVELS } from './programProgress';

export type SessionRepType = 'reps' | 'duration';
export type SessionDisplayLabel = 'REPS' | 'MINS';

export type GuidedSessionExercise = {
  id: string;
  repType: SessionRepType;
  repValue: number;
  displayValue: string;
  displayLabel: SessionDisplayLabel;
  portraitVideo: string;
};

export type GuidedSession = {
  level: number;
  restSeconds: number;
  exercises: GuidedSessionExercise[];
};

type LevelProgram = {
  level: number;
  exerciseIds: string[];
};

const levelPrograms = (dayExercisesData as { levels: LevelProgram[] }).levels;
const REST_SECONDS = 20;

function buildExercise(id: string): GuidedSessionExercise | null {
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

function buildSessionForLevel(level: number): GuidedSession | null {
  const program = levelPrograms.find((entry) => entry.level === level);
  if (!program) return null;

  const exercises = program.exerciseIds
    .map((id) => buildExercise(id))
    .filter((entry): entry is GuidedSessionExercise => entry != null);

  return { level, restSeconds: REST_SECONDS, exercises };
}

const sessionsByLevel = Object.fromEntries(
  Array.from({ length: TOTAL_LEVELS }, (_, index) => {
    const level = index + 1;
    const session = buildSessionForLevel(level);
    return session ? [level, session] : [];
  }),
) as Record<number, GuidedSession>;

export function hasGuidedSession(level: number): boolean {
  return Boolean(sessionsByLevel[level]);
}

export function getSessionForLevel(level: number): GuidedSession | null {
  return sessionsByLevel[level] ?? null;
}

export function getSessionExercisesForLevel(level: number): GuidedSessionExercise[] {
  return sessionsByLevel[level]?.exercises ?? [];
}

export function getSessionExerciseForLevel(
  level: number,
  index: number,
): GuidedSessionExercise | null {
  return sessionsByLevel[level]?.exercises[index] ?? null;
}

export function getSessionRestSecondsForLevel(level: number): number {
  return sessionsByLevel[level]?.restSeconds ?? REST_SECONDS;
}

export function isSessionCompleteForLevel(level: number, index: number): boolean {
  const session = sessionsByLevel[level];
  if (!session) return true;
  return index >= session.exercises.length;
}

// Backward-compatible Day 1 aliases
export type Day1SessionExercise = GuidedSessionExercise;
export type Day1Session = GuidedSession;

export function getDay1Session(): Day1Session {
  return sessionsByLevel[1];
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

// Legacy names used during migration
export const getSessionForDay = getSessionForLevel;
export const getSessionExercisesForDay = getSessionExercisesForLevel;
export const getSessionExerciseForDay = getSessionExerciseForLevel;
export const getSessionRestSecondsForDay = getSessionRestSecondsForLevel;
export const isSessionCompleteForDay = isSessionCompleteForLevel;
