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

/** One wrist infographic for both men and women. Tamil uses its own poster. */
const MANUAL_PULSE_IMAGE = `${FEMALE_FOLDER}/Manual Pulse Check Infographic.png`;
const TAMIL_MANUAL_PULSE_IMAGE = `${MALE_FOLDER}/Tamil wrist guide.png`;

/** Step 6 already circles the heart rate. Same file for every gender. */
const HEART_RATE_GUIDE_IMAGE = 'Coachmarks/Pulse Oximeter Heart Rate Guide.png';
const TAMIL_HEART_RATE_GUIDE_IMAGE = `${MALE_FOLDER}/Pulse Oximeter Heart Rate tamil.png`;

function usesTamilGuide(language?: string | null): boolean {
  return (language ?? '').toLowerCase().startsWith('ta');
}

/** The seated “wait for the reading” frame. */
export const PULSE_OXIMETER_HAND_STEP = 5;

/** Step 6 uses the shared heart-rate guide, which already circles the pulse. */
export const PULSE_VALUE_MARK_STEP = 6;

export function getPulseOximeterCoachImageUrl(
  step: number,
  mediaGender: PulseOximeterMediaGender,
  language?: string | null,
): string | null {
  if (step < 1 || step > PULSE_OXIMETER_COACH_STEP_COUNT) return null;
  if (step === PULSE_OXIMETER_HAND_STEP) {
    return getPublicStorageUrl(STEP_HAND_IMAGE[mediaGender]);
  }
  if (step === PULSE_VALUE_MARK_STEP) {
    return getPublicStorageUrl(
      usesTamilGuide(language) ? TAMIL_HEART_RATE_GUIDE_IMAGE : HEART_RATE_GUIDE_IMAGE,
    );
  }
  const objectPath =
    mediaGender === 'female'
      ? `${FEMALE_FOLDER}/pulse_oximeter_step_${step}.png`
      : `${MALE_FOLDER}/male_pulse_oximeter_step_${step}.png`;
  return getPublicStorageUrl(objectPath);
}

/** Same manual-method poster for every gender. Tamil uses the Tamil wrist guide. */
export function getManualPulseGuideUrl(
  _mediaGender?: PulseOximeterMediaGender,
  language?: string | null,
): string | null {
  const url = getPublicStorageUrl(
    usesTamilGuide(language) ? TAMIL_MANUAL_PULSE_IMAGE : MANUAL_PULSE_IMAGE,
  );
  // New filename. A query keeps a previously failed disk cache from sticking.
  return url ? `${url}?v=2` : null;
}

export function getPulseOximeterCoachImageUrls(
  mediaGender: PulseOximeterMediaGender,
  language?: string | null,
): string[] {
  const urls: string[] = [];
  for (let step = 1; step <= PULSE_OXIMETER_COACH_STEP_COUNT; step += 1) {
    const url = getPulseOximeterCoachImageUrl(step, mediaGender, language);
    if (url) urls.push(url);
  }
  return urls;
}
