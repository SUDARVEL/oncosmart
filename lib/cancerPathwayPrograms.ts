import pathwayPrograms from '../data/cancer-pathway-programs.json';
import type { CancerTypeSlug } from './cancerPathway';

export type PathwayExerciseKey =
  | 'diaphragmatic-breathing'
  | 'ankle-pumps'
  | 'thoracic-expansion'
  | 'incentive-spirometer'
  | 'chest-stretch'
  | 'arm-circles'
  | 'arm-rotation'
  | 'biceps-curls'
  | 'wall-climbing'
  | 'triceps-stretch'
  | 'spot-marching'
  | 'shoulder-shrugging'
  | 'shoulder-retraction'
  | 'shoulder-external-rotation'
  | 'wall-slides'
  | 'wall-pushup'
  | 'seated-knee-extension'
  | 'standing-hamstring-curls'
  | 'hamstring-stretch'
  | 'quadriceps-stretch'
  | 'straight-leg-raise'
  | 'heel-slides'
  | 'pelvic-bridge'
  | 'calf-raise'
  | 'calf-stretch'
  | 'neck-nodding'
  | 'neck-flexion-extension'
  | 'neck-side-flexion'
  | 'neck-rotation'
  | 'jaw-opening-closing'
  | 'jaw-side-to-side'
  | 'neck-stretch';

export type PathwayDose = {
  repType: 'reps' | 'duration';
  repValue: number;
  displayValue: string;
  displayLabel: 'REPS' | 'MINS' | 'SECS';
};

type PathwayProgramsFile = {
  levelRepDefaults: Record<string, { reps: number; sets: number }>;
  pathways: Record<
    string,
    {
      label: string;
      levels: Record<string, string[]>;
    }
  >;
};

const data = pathwayPrograms as PathwayProgramsFile;

/** Level 3 and 4 reuse the Level 2 exercise sequence when a level has no list of its own. */
export function getPathwaySequenceLevel(level: number): 1 | 2 {
  if (level <= 1) return 1;
  return 2;
}

export function getPathwayExerciseSequence(
  cancerType: CancerTypeSlug,
  level: number,
): PathwayExerciseKey[] {
  const pathway = data.pathways[cancerType];
  const direct = pathway?.levels[String(level)];
  if (direct && direct.length > 0) return direct as PathwayExerciseKey[];
  const sequenceLevel = getPathwaySequenceLevel(level);
  const sequence = pathway?.levels[String(sequenceLevel)] ?? [];
  return sequence as PathwayExerciseKey[];
}

export function getPathwayLevelRepDefault(level: number): { reps: number; sets: number } {
  const entry = data.levelRepDefaults[String(level)];
  if (entry) return entry;
  if (level >= 4) return { reps: 15, sets: 1 };
  if (level === 3) return { reps: 10, sets: 1 };
  return { reps: 5, sets: 1 };
}

const STRETCH_KEYS = new Set<PathwayExerciseKey>([
  'chest-stretch',
  'triceps-stretch',
  'hamstring-stretch',
  'quadriceps-stretch',
  'calf-stretch',
  'neck-stretch',
]);

/** Exercises that exist only in the Newly added storage folders. */
export const NEW_LIBRARY_EXERCISE_KEYS = new Set<PathwayExerciseKey>([
  'incentive-spirometer',
  'shoulder-retraction',
  'shoulder-external-rotation',
  'heel-slides',
  'pelvic-bridge',
  'neck-nodding',
  'neck-rotation',
  'neck-side-flexion',
]);

function repsDose(reps: number): PathwayDose {
  return {
    repType: 'reps',
    repValue: reps,
    displayValue: reps < 10 ? `0${reps}` : String(reps),
    displayLabel: 'REPS',
  };
}

/**
 * Sheet prescription for one step. This wins over the number printed in an
 * older filename, so a Level 4 clip stored as 10Reps still shows 15 reps.
 */
export function getPathwayStepDose(step: PathwayExerciseKey, level: number): PathwayDose {
  if (step === 'spot-marching') {
    return { repType: 'duration', repValue: 60, displayValue: '01', displayLabel: 'MINS' };
  }
  if (STRETCH_KEYS.has(step)) {
    return { repType: 'duration', repValue: 30, displayValue: '30', displayLabel: 'SECS' };
  }
  let reps = getPathwayLevelRepDefault(level).reps;
  if (step === 'incentive-spirometer') reps = level <= 2 ? 10 : 15;
  if (step === 'pelvic-bridge' && level >= 4) reps = 10;
  return repsDose(reps);
}

/** Breast Level 1 arm circles use the new short-lever clip. Other arm circles stay on the old video. */
export function usesNewLibraryClip(
  step: PathwayExerciseKey,
  cancerType: CancerTypeSlug,
  level: number,
): boolean {
  if (NEW_LIBRARY_EXERCISE_KEYS.has(step)) return true;
  return step === 'arm-circles' && cancerType === 'breast' && level === 1;
}

/**
 * Map a storage-derived slug (may include -left/-right) onto a diagram exercise key.
 * Arm circles in storage can satisfy an arm-rotation program step when needed.
 */
export function programKeyFromStorageSlug(storageSlug: string): PathwayExerciseKey | null {
  const base = storageSlug.replace(/-(left|right)$/i, '').toLowerCase();
  const aliases: Record<string, PathwayExerciseKey> = {
    'diaphragmatic-breathing': 'diaphragmatic-breathing',
    'ankle-pumps': 'ankle-pumps',
    'thoracic-expansion': 'thoracic-expansion',
    'incentive-spirometer': 'incentive-spirometer',
    'chest-stretch': 'chest-stretch',
    'arm-circles': 'arm-circles',
    'arm-rotation': 'arm-rotation',
    'biceps-curls': 'biceps-curls',
    'wall-climbing': 'wall-climbing',
    'triceps-stretch': 'triceps-stretch',
    'spot-marching': 'spot-marching',
    'shoulder-shrugging': 'shoulder-shrugging',
    'shoulder-retraction': 'shoulder-retraction',
    'shoulder-external-rotation': 'shoulder-external-rotation',
    'wall-slides': 'wall-slides',
    'wall-pushup': 'wall-pushup',
    'seated-knee-extension': 'seated-knee-extension',
    'standing-hamstring-curls': 'standing-hamstring-curls',
    'hamstring-stretch': 'hamstring-stretch',
    'quadriceps-stretch': 'quadriceps-stretch',
    'straight-leg-raise': 'straight-leg-raise',
    'heel-slides': 'heel-slides',
    'pelvic-bridge': 'pelvic-bridge',
    'calf-raise': 'calf-raise',
    'calf-stretch': 'calf-stretch',
    'neck-nodding': 'neck-nodding',
    'neck-flexion-extension': 'neck-flexion-extension',
    'neck-side-flexion': 'neck-side-flexion',
    'neck-rotation': 'neck-rotation',
    'jaw-opening-closing': 'jaw-opening-closing',
    'jaw-side-to-side': 'jaw-side-to-side',
    'neck-stretch': 'neck-stretch',
  };
  return aliases[base] ?? null;
}

/** Accept storage arm-circles for diagram arm-rotation (and vice versa) when matching videos. */
export function storageSlugMatchesProgramKey(
  storageSlug: string,
  programKey: PathwayExerciseKey,
): boolean {
  const key = programKeyFromStorageSlug(storageSlug);
  if (!key) return false;
  if (key === programKey) return true;
  if (
    (programKey === 'arm-rotation' && key === 'arm-circles') ||
    (programKey === 'arm-circles' && key === 'arm-rotation')
  ) {
    return true;
  }
  return false;
}

export function getPathwayProgramLabel(cancerType: CancerTypeSlug): string {
  return data.pathways[cancerType]?.label ?? cancerType;
}
