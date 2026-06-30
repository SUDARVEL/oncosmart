export const DAYS_PER_LEVEL = 7;
export const TOTAL_LEVELS = 4;
export const TOTAL_SESSIONS = DAYS_PER_LEVEL * TOTAL_LEVELS;
export const UNLOCK_DELAY_MS = 24 * 60 * 60 * 1000;

export type SessionStatus = 'completed' | 'available' | 'locked';

export type SessionState = {
  level: number;
  dayInLevel: number;
  status: SessionStatus;
  completedAt: number | null;
  unlockAt: number | null;
  remainingMs: number;
  blockedByPrevious: boolean;
  blockedByLevel: boolean;
};

type Completions = Record<string, number>;

export function sessionKey(level: number, dayInLevel: number): string {
  return `L${level}D${dayInLevel}`;
}

export function parseSessionKey(key: string): { level: number; dayInLevel: number } | null {
  const match = /^L(\d+)D(\d+)$/.exec(key);
  if (!match) return null;
  return { level: Number(match[1]), dayInLevel: Number(match[2]) };
}

export function getPreviousSessionKey(level: number, dayInLevel: number): string | null {
  if (dayInLevel > 1) return sessionKey(level, dayInLevel - 1);
  if (level > 1) return sessionKey(level - 1, DAYS_PER_LEVEL);
  return null;
}

export function getNextSession(level: number, dayInLevel: number): { level: number; dayInLevel: number } | null {
  if (dayInLevel < DAYS_PER_LEVEL) return { level, dayInLevel: dayInLevel + 1 };
  if (level < TOTAL_LEVELS) return { level: level + 1, dayInLevel: 1 };
  return null;
}

export function isLevelComplete(level: number, completions: Completions): boolean {
  for (let day = 1; day <= DAYS_PER_LEVEL; day += 1) {
    if (!completions[sessionKey(level, day)]) return false;
  }
  return true;
}

export function getCompletedLevelsCount(completions: Completions): number {
  let count = 0;
  for (let level = 1; level <= TOTAL_LEVELS; level += 1) {
    if (isLevelComplete(level, completions)) count += 1;
  }
  return count;
}

export function getCompletedSessionCount(completions: Completions): number {
  return Object.keys(completions).filter((key) => parseSessionKey(key)).length;
}

export function getActiveLevel(completions: Completions): number {
  for (let level = 1; level <= TOTAL_LEVELS; level += 1) {
    if (!isLevelComplete(level, completions)) return level;
  }
  return TOTAL_LEVELS;
}

export function isLevelUnlocked(level: number, completions: Completions): boolean {
  if (level <= 1) return true;
  return isLevelComplete(level - 1, completions);
}

export function getSessionState(
  level: number,
  dayInLevel: number,
  completions: Completions,
  now: number,
  devOverride = false,
): SessionState {
  const key = sessionKey(level, dayInLevel);
  const completedAt = completions[key] ?? null;

  if (completedAt) {
    return {
      level,
      dayInLevel,
      status: 'completed',
      completedAt,
      unlockAt: null,
      remainingMs: 0,
      blockedByPrevious: false,
      blockedByLevel: false,
    };
  }

  if (!isLevelUnlocked(level, completions)) {
    return {
      level,
      dayInLevel,
      status: 'locked',
      completedAt: null,
      unlockAt: null,
      remainingMs: 0,
      blockedByPrevious: false,
      blockedByLevel: true,
    };
  }

  const prevKey = getPreviousSessionKey(level, dayInLevel);
  if (!prevKey) {
    return {
      level,
      dayInLevel,
      status: 'available',
      completedAt: null,
      unlockAt: null,
      remainingMs: 0,
      blockedByPrevious: false,
      blockedByLevel: false,
    };
  }

  const prevCompletedAt = completions[prevKey] ?? null;
  if (!prevCompletedAt) {
    return {
      level,
      dayInLevel,
      status: 'locked',
      completedAt: null,
      unlockAt: null,
      remainingMs: 0,
      blockedByPrevious: true,
      blockedByLevel: false,
    };
  }

  const unlockAt = prevCompletedAt + UNLOCK_DELAY_MS;
  if (devOverride || now >= unlockAt) {
    return {
      level,
      dayInLevel,
      status: 'available',
      completedAt: null,
      unlockAt,
      remainingMs: 0,
      blockedByPrevious: false,
      blockedByLevel: false,
    };
  }

  return {
    level,
    dayInLevel,
    status: 'locked',
    completedAt: null,
    unlockAt,
    remainingMs: Math.max(0, unlockAt - now),
    blockedByPrevious: false,
    blockedByLevel: false,
  };
}

export function getVisibleLevels(completions: Completions): number[] {
  const active = getActiveLevel(completions);
  const levels: number[] = [];
  for (let level = 1; level <= Math.min(active + 1, TOTAL_LEVELS); level += 1) {
    levels.push(level);
  }
  return levels;
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
