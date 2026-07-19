import { EXERCISE_PORTRAIT_VIDEOS } from './exercisePortraitVideos';

type SessionRepType = 'reps' | 'duration';
type SessionDisplayLabel = 'REPS' | 'MINS' | 'SECS';

type RepConfig = {
  repType: SessionRepType;
  /** Prescription in seconds (duration) or count (reps). Used for timers — never video file length. */
  repValue: number;
  displayValue: string;
  displayLabel: SessionDisplayLabel;
  portraitVideo?: string;
};

function pv(exerciseId: string): string {
  return EXERCISE_PORTRAIT_VIDEOS[exerciseId] ?? '';
}

/**
 * Figma prescription values from:
 * - Female English Flow Prototype `2914:24316` (slider stack)
 * - Male Tamil High Fidelity `2271:3276` (slider stack)
 *
 * Both languages/genders share the same numbers:
 *   10 REPS / முறை · 20 REPS (ankle) · 02 MINS / நிமி (spot marching) · 30sec / வினாடி (stretches)
 * REST between exercises is 20 sec (Timing component in the same files).
 */
export const EXERCISE_REP_CONFIG: Record<string, RepConfig> = {
  'diaphragmatic-breathing': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: pv('diaphragmatic-breathing'),
  },
  'ankle-pumps': {
    repType: 'reps',
    repValue: 20,
    displayValue: '20',
    displayLabel: 'REPS',
    portraitVideo: pv('ankle-pumps'),
  },
  'thoracic-expansion': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: pv('thoracic-expansion'),
  },
  'arm-circles': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: pv('arm-circles'),
  },
  'spot-marching': {
    repType: 'duration',
    repValue: 120,
    displayValue: '02',
    displayLabel: 'MINS',
    portraitVideo: pv('spot-marching'),
  },
  'shoulder-shrugging': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: pv('shoulder-shrugging'),
  },
  'biceps-curls': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: pv('biceps-curls'),
  },
  'wall-pushup': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: pv('wall-pushup'),
  },
  'calf-raise': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: pv('calf-raise'),
  },
  'sit-to-stand': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: pv('sit-to-stand'),
  },
  'straight-leg-raise-right': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: pv('straight-leg-raise-right'),
  },
  'straight-leg-raise-left': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: pv('straight-leg-raise-left'),
  },
  'knee-to-chest-right': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: pv('knee-to-chest-right'),
  },
  'knee-to-chest-left': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: pv('knee-to-chest-left'),
  },
  'static-quadriceps-right': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: pv('static-quadriceps-right'),
  },
  'static-quadriceps-left': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: pv('static-quadriceps-left'),
  },
  'hamstring-stretch': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'SECS',
    portraitVideo: pv('hamstring-stretch'),
  },
  'quadriceps-stretch-right': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'SECS',
    portraitVideo: pv('quadriceps-stretch-right'),
  },
  'quadriceps-stretch-left': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'SECS',
    portraitVideo: pv('quadriceps-stretch-left'),
  },
  'calf-stretch-right': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'SECS',
    portraitVideo: pv('calf-stretch-right'),
  },
  'calf-stretch-left': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'SECS',
    portraitVideo: pv('calf-stretch-left'),
  },
  'chest-stretch': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'SECS',
    portraitVideo: pv('chest-stretch'),
  },
  'triceps-stretch-right': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'SECS',
    portraitVideo: pv('triceps-stretch-right'),
  },
  'triceps-stretch-left': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'SECS',
    portraitVideo: pv('triceps-stretch-left'),
  },
  'neck-stretch-right': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'SECS',
    portraitVideo: pv('neck-stretch-right'),
  },
  'neck-stretch-left': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'SECS',
    portraitVideo: pv('neck-stretch-left'),
  },
};

/** Session-list badge text derived from the Figma prescription (not video length). */
export function getFigmaRepBadge(exerciseId: string): string | null {
  const config = EXERCISE_REP_CONFIG[exerciseId];
  if (!config) return null;
  if (config.displayLabel === 'REPS') return `x${config.displayValue}`;
  if (config.displayLabel === 'MINS') {
    const mins = Number.parseInt(config.displayValue, 10);
    return Number.isFinite(mins) ? `${mins}:00` : `${config.displayValue}:00`;
  }
  const secs = String(config.repValue).padStart(2, '0');
  return `00:${secs}`;
}
