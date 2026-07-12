export type BadgeKey = 'startup' | 'consistent' | 'strength' | 'hero' | 'unstoppable';

export const BADGE_ORDER: readonly BadgeKey[] = [
  'startup',
  'consistent',
  'strength',
  'hero',
  'unstoppable',
] as const;

/** Badge unlocked when that level number is fully completed. */
export const LEVEL_COMPLETION_BADGE: Record<number, BadgeKey> = {
  1: 'consistent',
  2: 'strength',
  3: 'hero',
  4: 'unstoppable',
};

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

/** Newly earned badges in display order (after − before). */
export function getNewlyEarnedBadges(
  before: Set<BadgeKey>,
  after: Set<BadgeKey>,
): BadgeKey[] {
  return BADGE_ORDER.filter((key) => after.has(key) && !before.has(key));
}

export function parseBadgeKeysParam(value: string | string[] | undefined): BadgeKey[] {
  const raw = Array.isArray(value) ? value.join(',') : value ?? '';
  if (!raw.trim()) return [];
  const allowed = new Set<string>(BADGE_ORDER);
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter((part): part is BadgeKey => allowed.has(part));
}
