/** How the patient froze the program — pause (Growth) vs quit (mid-exercise exit). */
export type ProgressHoldType = 'pause' | 'quit';

/** Reasons from Growth → Pause Progress. */
export type PauseReason = 'tired' | 'pain' | 'treatment' | 'unwell';

/** Reasons from guided session → Why did you stop? */
export type QuitReason = 'tired' | 'pain' | 'exploring';

export type HoldReason = PauseReason | QuitReason;

const PAUSE_REASONS = new Set<PauseReason>(['tired', 'pain', 'treatment', 'unwell']);
const QUIT_REASONS = new Set<QuitReason>(['tired', 'pain', 'exploring']);

export function asPauseReason(value: unknown): PauseReason | null {
  return typeof value === 'string' && PAUSE_REASONS.has(value as PauseReason)
    ? (value as PauseReason)
    : null;
}

export function asQuitReason(value: unknown): QuitReason | null {
  return typeof value === 'string' && QUIT_REASONS.has(value as QuitReason)
    ? (value as QuitReason)
    : null;
}

/** @deprecated use asPauseReason / asQuitReason */
export function asHoldReason(value: unknown): HoldReason | null {
  return asPauseReason(value) ?? asQuitReason(value);
}

export function asProgressHoldType(value: unknown): ProgressHoldType | null {
  if (value === 'pause' || value === 'quit') return value;
  return null;
}
