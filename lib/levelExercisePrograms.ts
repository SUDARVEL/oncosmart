/**
 * Exercise order for each program level (single source of truth).
 * Used by guided sessions, exercise lists, pain-score flow, and Growth workouts.
 */
export type LevelExerciseProgram = {
  level: number;
  exerciseIds: readonly string[];
};

export const LEVEL_EXERCISE_PROGRAMS: readonly LevelExerciseProgram[] = [
  {
    level: 1,
    exerciseIds: [
      'diaphragmatic-breathing',
      'ankle-pumps',
      'thoracic-expansion',
      'arm-circles',
      'spot-marching',
      'hamstring-stretch',
      'quadriceps-stretch-right',
      'quadriceps-stretch-left',
      'calf-stretch-right',
      'calf-stretch-left',
      'chest-stretch',
      'triceps-stretch-right',
      'triceps-stretch-left',
      'neck-stretch-right',
      'neck-stretch-left',
    ],
  },
  {
    level: 2,
    exerciseIds: [
      'diaphragmatic-breathing',
      'ankle-pumps',
      'thoracic-expansion',
      'arm-circles',
      'spot-marching',
      'shoulder-shrugging',
      'biceps-curls',
      'wall-pushup',
      'calf-raise',
      'sit-to-stand',
      'straight-leg-raise-right',
      'straight-leg-raise-left',
      'knee-to-chest-right',
      'knee-to-chest-left',
      'static-quadriceps-right',
      'static-quadriceps-left',
      'hamstring-stretch',
      'quadriceps-stretch-right',
      'quadriceps-stretch-left',
      'calf-stretch-right',
      'calf-stretch-left',
      'chest-stretch',
      'triceps-stretch-right',
      'triceps-stretch-left',
      'neck-stretch-right',
      'neck-stretch-left',
    ],
  },
  {
    level: 3,
    exerciseIds: [
      'diaphragmatic-breathing',
      'ankle-pumps',
      'thoracic-expansion',
      'arm-circles',
      'spot-marching',
      'shoulder-shrugging',
      'biceps-curls',
      'wall-pushup',
      'calf-raise',
      'sit-to-stand',
      'straight-leg-raise-right',
      'straight-leg-raise-left',
      'knee-to-chest-right',
      'knee-to-chest-left',
      'static-quadriceps-right',
      'static-quadriceps-left',
      'hamstring-stretch',
      'quadriceps-stretch-right',
      'quadriceps-stretch-left',
      'calf-stretch-right',
      'calf-stretch-left',
      'chest-stretch',
      'triceps-stretch-right',
      'triceps-stretch-left',
      'neck-stretch-right',
      'neck-stretch-left',
    ],
  },
  {
    level: 4,
    exerciseIds: [
      'diaphragmatic-breathing',
      'ankle-pumps',
      'thoracic-expansion',
      'arm-circles',
      'spot-marching',
      'shoulder-shrugging',
      'biceps-curls',
      'wall-pushup',
      'calf-raise',
      'sit-to-stand',
      'straight-leg-raise-right',
      'straight-leg-raise-left',
      'knee-to-chest-right',
      'knee-to-chest-left',
      'static-quadriceps-right',
      'static-quadriceps-left',
      'hamstring-stretch',
      'quadriceps-stretch-right',
      'quadriceps-stretch-left',
      'calf-stretch-right',
      'calf-stretch-left',
      'chest-stretch',
      'triceps-stretch-right',
      'triceps-stretch-left',
      'neck-stretch-right',
      'neck-stretch-left',
    ],
  },
] as const;

export function getLevelExerciseProgram(level: number): LevelExerciseProgram | null {
  return LEVEL_EXERCISE_PROGRAMS.find((entry) => entry.level === level) ?? null;
}

export function getExerciseIdsForLevel(level: number): readonly string[] {
  return getLevelExerciseProgram(level)?.exerciseIds ?? [];
}

export function isExerciseInLevel(level: number, exerciseId: string): boolean {
  return getExerciseIdsForLevel(level).includes(exerciseId);
}
