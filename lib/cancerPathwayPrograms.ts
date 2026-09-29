import pathwayPrograms from '../data/cancer-pathway-programs.json';
import type { CancerTypeSlug } from './cancerPathway';

export type PathwayExerciseKey =
  | 'diaphragmatic-breathing'
  | 'ankle-pumps'
  | 'thoracic-expansion'
  | 'chest-stretch'
  | 'arm-circles'
  | 'arm-rotation'
  | 'biceps-curls'
  | 'wall-climbing'
  | 'triceps-stretch'
  | 'spot-marching'
  | 'shoulder-shrugging'
  | 'wall-slides'
  | 'wall-pushup'
  | 'seated-knee-extension'
  | 'standing-hamstring-curls'
  | 'hamstring-stretch'
  | 'quadriceps-stretch'
  | 'straight-leg-raise'
  | 'calf-raise'
  | 'calf-stretch'
  | 'neck-flexion-extension'
  | 'jaw-opening-closing'
  | 'jaw-side-to-side'
  | 'neck-stretch';

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

/** Level 3 and 4 reuse the Level 2 exercise sequence (diagrams). */
export function getPathwaySequenceLevel(level: number): 1 | 2 {
  if (level <= 1) return 1;
  return 2;
}

export function getPathwayExerciseSequence(
  cancerType: CancerTypeSlug,
  level: number,
): PathwayExerciseKey[] {
  const sequenceLevel = getPathwaySequenceLevel(level);
  const pathway = data.pathways[cancerType];
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
    'chest-stretch': 'chest-stretch',
    'arm-circles': 'arm-circles',
    'arm-rotation': 'arm-rotation',
    'biceps-curls': 'biceps-curls',
    'wall-climbing': 'wall-climbing',
    'triceps-stretch': 'triceps-stretch',
    'spot-marching': 'spot-marching',
    'shoulder-shrugging': 'shoulder-shrugging',
    'wall-slides': 'wall-slides',
    'wall-pushup': 'wall-pushup',
    'seated-knee-extension': 'seated-knee-extension',
    'standing-hamstring-curls': 'standing-hamstring-curls',
    'hamstring-stretch': 'hamstring-stretch',
    'quadriceps-stretch': 'quadriceps-stretch',
    'straight-leg-raise': 'straight-leg-raise',
    'calf-raise': 'calf-raise',
    'calf-stretch': 'calf-stretch',
    'neck-flexion-extension': 'neck-flexion-extension',
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
