type SessionRepType = 'reps' | 'duration';
type SessionDisplayLabel = 'REPS' | 'MINS';

type RepConfig = {
  repType: SessionRepType;
  repValue: number;
  displayValue: string;
  displayLabel: SessionDisplayLabel;
  portraitVideo?: string;
};

export const EXERCISE_REP_CONFIG: Record<string, RepConfig> = {
  'diaphragmatic-breathing': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'ankle-pumps': {
    repType: 'reps',
    repValue: 20,
    displayValue: '20',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'thoracic-expansion': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'arm-circles': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'spot-marching': {
    repType: 'duration',
    repValue: 120,
    displayValue: '02',
    displayLabel: 'MINS',
    portraitVideo: '',
  },
  'shoulder-shrugging': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: 'Shoulder shrugs Male English.mp4',
  },
  'biceps-curls': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: 'Biceps curls Male English.mp4',
  },
  'wall-pushup': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: 'Wall Pushup Male English.mp4',
  },
  'calf-raise': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: 'Calf stretch Male Left English.mp4',
  },
  'sit-to-stand': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: 'Sit To Stand Male English-1 compressed.mp4',
  },
  'straight-leg-raise-right': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: 'SLR Right Male English.mp4',
  },
  'straight-leg-raise-left': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: 'SLR Left Male English.mp4',
  },
  'knee-to-chest-right': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'knee-to-chest-left': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'static-quadriceps-right': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'static-quadriceps-left': {
    repType: 'reps',
    repValue: 10,
    displayValue: '10',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'hamstring-stretch': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'quadriceps-stretch-right': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'quadriceps-stretch-left': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'calf-stretch-right': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'calf-stretch-left': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'chest-stretch': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'triceps-stretch-right': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'triceps-stretch-left': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'neck-stretch-right': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
  'neck-stretch-left': {
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'REPS',
    portraitVideo: '',
  },
};
