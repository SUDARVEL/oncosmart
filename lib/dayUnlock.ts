export {
  DAYS_PER_LEVEL,
  TOTAL_LEVELS,
  TOTAL_SESSIONS,
  UNLOCK_DELAY_MS,
  formatCountdown,
  getActiveLevel,
  getCompletedLevelsCount,
  getCompletedSessionCount,
  getNextSession,
  getSessionState,
  getVisibleLevels,
  isLevelComplete,
  isLevelUnlocked,
  parseSessionKey,
  sessionKey,
  type SessionState,
  type SessionStatus,
} from './programProgress';

// Legacy aliases
export { TOTAL_SESSIONS as TOTAL_DAYS } from './programProgress';
export type { SessionState as DayState } from './programProgress';
export { getSessionState as getDayState } from './programProgress';
export { getCompletedSessionCount as getCompletedCount } from './programProgress';
