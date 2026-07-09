import type { TFunction } from 'i18next';

import type { WorkoutDetail } from './getWorkoutDetails';

export function getWorkoutRepLabel(
  workout: Pick<WorkoutDetail, 'repType' | 'repValue' | 'displayLabel'>,
  t: TFunction,
): string {
  if (workout.repType === 'reps') {
    return t('sessionFlow.repsLabel');
  }

  if (workout.repValue >= 60) {
    return t('sessionFlow.minsLabel');
  }

  return t('sessionFlow.secsLabel');
}
