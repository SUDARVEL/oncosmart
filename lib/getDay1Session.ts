import day1SessionData from '../data/day1-session.json';

export type SessionRepType = 'reps' | 'duration';
export type SessionDisplayLabel = 'REPS' | 'MINS';

export type Day1SessionExercise = {
  id: string;
  repType: SessionRepType;
  /** Target reps or duration in seconds. */
  repValue: number;
  displayValue: string;
  displayLabel: SessionDisplayLabel;
  portraitVideo: string;
};

export type Day1Session = {
  day: number;
  restSeconds: number;
  exercises: Day1SessionExercise[];
};

const session = day1SessionData as Day1Session;

export function getDay1Session(): Day1Session {
  return session;
}

export function getDay1SessionExercises(): Day1SessionExercise[] {
  return session.exercises;
}

export function getDay1SessionExercise(index: number): Day1SessionExercise | null {
  return session.exercises[index] ?? null;
}

export function getDay1RestSeconds(): number {
  return session.restSeconds;
}

export function isDay1SessionComplete(index: number): boolean {
  return index >= session.exercises.length;
}
