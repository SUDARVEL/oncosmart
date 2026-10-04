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
/** Step 5 is the seated check. These files show the device on the correct hand. */
const STEP_HAND_IMAGE: Record<PulseOximeterMediaGender, string> = {
  female: `${FEMALE_FOLDER}/Mirrored Pulse Oximeter Check.png`,
  male: `${MALE_FOLDER}/Opposite-Hand Pulse Oximeter Check.png`,
};

/** One wrist infographic for both men and women. */
const MANUAL_PULSE_IMAGE = `${FEMALE_FOLDER}/Manual Pulse Check Infographic.png`;

/** Step 6 already circles the heart rate. Same file for every gender. */
const HEART_RATE_GUIDE_IMAGE = 'Coachmarks/Pulse Oximeter Heart Rate Guide.png';

/** The seated “wait for the reading” frame. */
export const PULSE_OXIMETER_HAND_STEP = 5;

/** Step 6 uses the shared heart-rate guide, which already circles the pulse. */
export const PULSE_VALUE_MARK_STEP = 6;

export function getPulseOximeterCoachImageUrl(
  step: number,
  mediaGender: PulseOximeterMediaGender,
): string | null {
  if (step < 1 || step > PULSE_OXIMETER_COACH_STEP_COUNT) return null;
  if (step === PULSE_OXIMETER_HAND_STEP) {
    return getPublicStorageUrl(STEP_HAND_IMAGE[mediaGender]);
  }
  if (step === PULSE_VALUE_MARK_STEP) {
    return getPublicStorageUrl(HEART_RATE_GUIDE_IMAGE);
  }
  const objectPath =
    mediaGender === 'female'
      ? `${FEMALE_FOLDER}/pulse_oximeter_step_${step}.png`
      : `${MALE_FOLDER}/male_pulse_oximeter_step_${step}.png`;
  return getPublicStorageUrl(objectPath);
}

/** Same manual-method poster for every gender. */
export function getManualPulseGuideUrl(
  _mediaGender?: PulseOximeterMediaGender,
): string | null {
  return getPublicStorageUrl(MANUAL_PULSE_IMAGE);
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
