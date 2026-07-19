import type { TFunction } from 'i18next';

import type { WorkoutDetail } from './getWorkoutDetails';

export function getWorkoutRepLabel(
  workout: Pick<WorkoutDetail, 'repType' | 'repValue' | 'displayLabel'>,
  t: TFunction,
): string {
  if (workout.repType === 'reps' || workout.displayLabel === 'REPS') {
    return t('sessionFlow.repsLabel');
  }

  if (workout.displayLabel === 'SECS' || (workout.repValue > 0 && workout.repValue < 60)) {
    return t('sessionFlow.secsLabel');
  }

  return t('sessionFlow.minsLabel');
}
