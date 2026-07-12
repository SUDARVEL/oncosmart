/** Ignore end signals that fire before real playback begins. */
const MIN_PLAYED_SECONDS = 0.75;

export function shouldAcceptVideoEnd(
  currentTime: number,
  duration: number,
  hasStarted: boolean,
): boolean {
  if (!hasStarted) return false;
  if (!Number.isFinite(currentTime) || currentTime < MIN_PLAYED_SECONDS) return false;
  if (!Number.isFinite(duration) || duration <= 0) return true;
  return currentTime >= duration - 1.5 || currentTime / duration >= 0.9;
}
