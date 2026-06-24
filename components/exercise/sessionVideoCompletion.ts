/** Minimum seconds played before an end signal is accepted. */
const MIN_WATCHED_SECONDS = 1;

/** Seconds from the reported duration that still count as finished. */
const END_EPSILON_SECONDS = 0.5;

export function canMarkVideoComplete(
  duration: number,
  currentTime: number,
  hasStarted: boolean,
): boolean {
  if (!hasStarted) return false;
  if (!Number.isFinite(duration) || duration < MIN_WATCHED_SECONDS) return false;
  if (!Number.isFinite(currentTime) || currentTime < MIN_WATCHED_SECONDS) return false;

  return duration - currentTime <= END_EPSILON_SECONDS;
}

export function isNearVideoEnd(duration: number, currentTime: number): boolean {
  if (!Number.isFinite(duration) || duration < MIN_WATCHED_SECONDS) return false;
  if (!Number.isFinite(currentTime)) return false;

  return duration - currentTime <= END_EPSILON_SECONDS;
}
