export const TOTAL_DAYS = 5;
export const UNLOCK_DELAY_MS = 24 * 60 * 60 * 1000;

export type DayStatus = 'completed' | 'available' | 'locked';

export type DayState = {
  day: number;
  status: DayStatus;
  /** Epoch ms this day was completed, or null. */
  completedAt: number | null;
  /** Epoch ms this day becomes available (only when waiting on the 24h gate). */
  unlockAt: number | null;
  /** ms remaining until unlock (0 unless status is 'locked' with a timer). */
  remainingMs: number;
  /** True when locked because the previous day isn't finished yet. */
  blockedByPrevious: boolean;
};

type Completions = Record<string, number>;

export function getCompletedCount(completions: Completions): number {
  return Object.keys(completions).length;
}

/**
 * Compute the gating state of a given day.
 * - Day 1 is always available (until completed).
 * - Day N (N>1) unlocks 24h after day N-1 was completed.
 * - `devOverride` bypasses the 24h wait (still requires the previous day done).
 */
export function getDayState(
  day: number,
  completions: Completions,
  now: number,
  devOverride = false,
): DayState {
  const completedAt = completions[String(day)] ?? null;

  if (completedAt) {
    return {
      day,
      status: 'completed',
      completedAt,
      unlockAt: null,
      remainingMs: 0,
      blockedByPrevious: false,
    };
  }

  if (day <= 1) {
    return {
      day,
      status: 'available',
      completedAt: null,
      unlockAt: null,
      remainingMs: 0,
      blockedByPrevious: false,
    };
  }

  const prevCompletedAt = completions[String(day - 1)] ?? null;

  if (!prevCompletedAt) {
    return {
      day,
      status: 'locked',
      completedAt: null,
      unlockAt: null,
      remainingMs: 0,
      blockedByPrevious: true,
    };
  }

  const unlockAt = prevCompletedAt + UNLOCK_DELAY_MS;

  if (devOverride || now >= unlockAt) {
    return {
      day,
      status: 'available',
      completedAt: null,
      unlockAt,
      remainingMs: 0,
      blockedByPrevious: false,
    };
  }

  return {
    day,
    status: 'locked',
    completedAt: null,
    unlockAt,
    remainingMs: Math.max(0, unlockAt - now),
    blockedByPrevious: false,
  };
}

/** Format ms remaining as a short countdown like "23h 45m" or "12m 30s". */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
