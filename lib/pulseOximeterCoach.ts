import { getPublicStorageUrl } from './supabaseStorage';

/** Seven-step pulse oximeter guide. Same steps for every cancer pathway. */
export const PULSE_OXIMETER_COACH_STEP_COUNT = 7;

const FEMALE_FOLDER = 'Coachmarks/pulse_oximeter_female_separate_images';
const MALE_FOLDER = 'Coachmarks/male_pulse_oximeter_separate_images';

export type PulseOximeterMediaGender = 'male' | 'female';

/**
 * Public still for one coach step.
 * Female and male each have their own seven frames in Supabase `Coachmarks`.
 * Breast, thorax, abdomen, and head & neck all use this gender set.
 */
export function getPulseOximeterCoachImageUrl(
  step: number,
  mediaGender: PulseOximeterMediaGender,
): string | null {
  if (step < 1 || step > PULSE_OXIMETER_COACH_STEP_COUNT) return null;
  const objectPath =
    mediaGender === 'female'
      ? `${FEMALE_FOLDER}/pulse_oximeter_step_${step}.png`
      : `${MALE_FOLDER}/male_pulse_oximeter_step_${step}.png`;
  return getPublicStorageUrl(objectPath);
}

export function getPulseOximeterCoachImageUrls(
  mediaGender: PulseOximeterMediaGender,
): string[] {
  const urls: string[] = [];
  for (let step = 1; step <= PULSE_OXIMETER_COACH_STEP_COUNT; step += 1) {
    const url = getPulseOximeterCoachImageUrl(step, mediaGender);
    if (url) urls.push(url);
  }
  return urls;
}
