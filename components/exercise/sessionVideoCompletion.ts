/** Ignore end signals that fire before real playback begins. */
const MIN_PLAYED_SECONDS = 1;

/** Require nearly the full clip so a glitch cannot finish the exercise early. */
const MIN_COMPLETION_RATIO = 0.9;

/**
 * Accept the native/web "ended" event only when the playhead truly reached the end
 * of THIS video's duration. Never invent progress from duration alone.
 *
 * `isAuthoritativeEnd` = the platform fired its own end event (playToEnd / onEnded),
 * which only happens at a clip's true end. Trust it (after real playback started) so
 * EVERY exercise video — male/female, Tamil/English — reliably advances even when the
 * file's duration metadata overestimates its actual content. The ratio/near-end guard
 * still protects any non-authoritative (progress-derived) completion checks.
 */
export function shouldAcceptVideoEnd(
  currentTime: number,
  duration: number,
  hasStarted: boolean,
  isAuthoritativeEnd = false,
): boolean {
  if (!hasStarted) return false;
  if (!Number.isFinite(currentTime) || currentTime < MIN_PLAYED_SECONDS) return false;

  if (isAuthoritativeEnd) return true;

  if (!Number.isFinite(duration) || duration <= 0) return false;

  const ratio = currentTime / duration;
  const nearEnd = duration - currentTime <= 1.25;
  return ratio >= MIN_COMPLETION_RATIO && nearEnd;
}
