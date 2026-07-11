export type BadgeKey = 'startup' | 'consistent' | 'strength' | 'hero' | 'unstoppable';

/**
 * Startup = first session completed.
 * Other badges unlock by completed levels.
 */
export function getEarnedBadges(
  levelsCompleted: number,
  sessionsCompleted = 0,
): Set<BadgeKey> {
  const earned = new Set<BadgeKey>();

  if (sessionsCompleted >= 1 || levelsCompleted >= 1) {
    earned.add('startup');
  }
  if (levelsCompleted >= 1) {
    earned.add('consistent');
  }
  if (levelsCompleted >= 2) {
    earned.add('strength');
  }
  if (levelsCompleted >= 3) {
    earned.add('hero');
  }
  if (levelsCompleted >= 4) {
    earned.add('unstoppable');
  }

  return earned;
}
