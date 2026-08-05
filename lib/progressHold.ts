import type { PauseReason } from '../store/useAppStore';

/** How the patient froze the program — pause (temporary) vs quit (stopped). */
export type ProgressHoldType = 'pause' | 'quit';

export type HoldReason = PauseReason;

const HOLD_REASONS = new Set<HoldReason>(['tired', 'pain', 'treatment', 'unwell']);

export function asHoldReason(value: unknown): HoldReason | null {
  return typeof value === 'string' && HOLD_REASONS.has(value as HoldReason)
    ? (value as HoldReason)
    : null;
}

export function asProgressHoldType(value: unknown): ProgressHoldType | null {
  if (value === 'pause' || value === 'quit') return value;
  return null;
}

export function reasonLabelKey(reason: string | null | undefined): string {
  switch (reason) {
    case 'tired':
      return 'admin.pauseReasonTired';
    case 'pain':
      return 'admin.pauseReasonPain';
    case 'treatment':
      return 'admin.pauseReasonTreatment';
    case 'unwell':
      return 'admin.pauseReasonUnwell';
    default:
      return '';
  }
}
