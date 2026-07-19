import type { AgeRange } from '../store/useAppStore';

/**
 * Moderate-exercise heart-rate target (60% of estimated max HR).
 * Estimated max HR = 220 − age (matches the clinical table in product copy).
 */
const AGE_RANGE_MIDPOINT: Record<AgeRange, number> = {
  '18-24': 21,
  '25-34': 30,
  '35-44': 40,
  '45-54': 50,
  '55-64': 60,
};

function resolveAgeYears(age: number | null | undefined, ageRange: AgeRange | null | undefined): number {
  if (typeof age === 'number' && Number.isFinite(age) && age > 0) {
    return Math.round(age);
  }
  if (ageRange) return AGE_RANGE_MIDPOINT[ageRange];
  return 40;
}

/** Heart-rate ceiling shown in the pulse oximeter popup (60% of max HR). */
export function getModerateHeartRateUpperLimit(
  age: number | null | undefined,
  ageRange: AgeRange | null | undefined = null,
): number {
  const years = resolveAgeYears(age, ageRange);
  const maxHr = 220 - years;
  return Math.round(maxHr * 0.6);
}
