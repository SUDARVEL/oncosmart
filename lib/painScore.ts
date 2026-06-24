export const PAIN_MIN = 0;
export const PAIN_MAX = 10;
/** Pain scores above this value trigger the ready-to-begin confirmation. */
export const HIGH_PAIN_THRESHOLD = 7;

export type PainTheme = {
  borderColor: string;
  scoreColor: string;
  label: string;
  gradientTop: string;
  gradientBottom: string;
};

export function getPainTheme(
  score: number,
  labels: { noPain: string; moderatePain: string; worstPain: string },
): PainTheme {
  const value = Math.round(score);

  if (value <= 3) {
    return {
      borderColor: '#6CB148',
      scoreColor: '#6CB148',
      label: labels.noPain,
      gradientTop: '#ECFDF5',
      gradientBottom: '#FFFFFF',
    };
  }

  if (value <= 7) {
    return {
      borderColor: '#F59E0B',
      scoreColor: '#F59E0B',
      label: labels.moderatePain,
      gradientTop: '#FEF3C7',
      gradientBottom: '#FFFFFF',
    };
  }

  return {
    borderColor: '#DC2626',
    scoreColor: '#DC2626',
    label: labels.worstPain,
    gradientTop: '#FECACA',
    gradientBottom: '#FFFFFF',
  };
}
