import { EXERCISE_PORTRAIT_VIDEOS } from './exercisePortraitVideos';

type SessionRepType = 'reps' | 'duration';
type SessionDisplayLabel = 'REPS' | 'MINS' | 'SECS';

type RepConfig = {
  repType: SessionRepType;
  repValue: number;
  displayValue: string;
  displayLabel: SessionDisplayLabel;
  portraitVideo?: string;
};

function pv(exerciseId: string): string {
  return EXERCISE_PORTRAIT_VIDEOS[exerciseId] ?? '';
}

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
