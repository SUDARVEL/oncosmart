/**
 * Exercise order for each program level.
 * Cancer pathways (gender × cancer type) are the source of truth when a cancer
 * slug is available; legacy lists remain for accounts without a pathway yet.
 */
import { normalizeCancerTypeSlug, type CancerTypeSlug } from './cancerPathway';
import { getPathwayExerciseSequence } from './cancerPathwayPrograms';
import { useAppStore } from '../store/useAppStore';

export type LevelExerciseProgram = {
  level: number;
  exerciseIds: readonly string[];
};

/** Pre-pathway fallback program (no cancer type selected). */
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

function resolveCancerType(
  cancerType?: string | CancerTypeSlug | null,
): CancerTypeSlug | null {
  if (cancerType === undefined) {
    return normalizeCancerTypeSlug(useAppStore.getState().cancerType);
  }
  return normalizeCancerTypeSlug(cancerType);
}

export function getLevelExerciseProgram(
  level: number,
  cancerType?: string | CancerTypeSlug | null,
): LevelExerciseProgram | null {
  const slug = resolveCancerType(cancerType);
  if (slug) {
    const exerciseIds = getPathwayExerciseSequence(slug, level);
    if (exerciseIds.length === 0) return null;
    return { level, exerciseIds };
  }
  return LEVEL_EXERCISE_PROGRAMS.find((entry) => entry.level === level) ?? null;
}

export function getExerciseIdsForLevel(
  level: number,
  cancerType?: string | CancerTypeSlug | null,
): readonly string[] {
  return getLevelExerciseProgram(level, cancerType)?.exerciseIds ?? [];
}

export function isExerciseInLevel(
  level: number,
  exerciseId: string,
  cancerType?: string | CancerTypeSlug | null,
): boolean {
  const base = exerciseId.replace(/-(left|right)$/i, '');
  return getExerciseIdsForLevel(level, cancerType).some(
    (id) => id === exerciseId || id === base || `${id}-left` === exerciseId || `${id}-right` === exerciseId,
  );
}
