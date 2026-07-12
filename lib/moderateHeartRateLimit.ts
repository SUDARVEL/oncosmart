import type { AgeRange } from '../store/useAppStore';

/**
 * Moderate-exercise heart-rate zone (50–70% of estimated max HR).
 * Estimated max HR = 220 − age (matches the clinical table in product copy).
 */
const AGE_RANGE_MIDPOINT: Record<AgeRange, number> = {
  '18-24': 21,
  '25-34': 30,
  '35-44': 40,
  '45-54': 50,
  '55-64': 60,
};

/** Upper bound of moderate zone (70% of max HR), shown in the pulse oximeter popup. */
export function getModerateHeartRateUpperLimit(ageRange: AgeRange | null): number {
  const age = ageRange ? AGE_RANGE_MIDPOINT[ageRange] : 40;
  const maxHr = 220 - age;
  return Math.round(maxHr * 0.7);
}
