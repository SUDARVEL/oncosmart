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

/**
 * Step 6 shows SpO2 and pulse together. This box is the heart icon plus the
 * pulse number in that step’s source image, so the guide can circle the value
 * the person should enter.
 */
export const PULSE_VALUE_MARK: Record<
  PulseOximeterMediaGender,
  { imageWidth: number; imageHeight: number; x: number; y: number; width: number; height: number }
> = {
  male: { imageWidth: 457, imageHeight: 380, x: 228, y: 160, width: 128, height: 50 },
  female: { imageWidth: 474, imageHeight: 386, x: 248, y: 160, width: 132, height: 52 },
};

/** Step whose illustration shows both readings. */
export const PULSE_VALUE_MARK_STEP = 6;

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
