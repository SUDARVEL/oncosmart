export type BadgeKey = 'startup' | 'consistent' | 'strength' | 'hero' | 'unstoppable';

const BADGE_THRESHOLDS: Record<BadgeKey, number> = {
  startup: 1,
  consistent: 1,
  strength: 2,
  hero: 3,
  unstoppable: 4,
};

export function getEarnedBadges(levelsCompleted: number): Set<BadgeKey> {
  const earned = new Set<BadgeKey>();

  (Object.keys(BADGE_THRESHOLDS) as BadgeKey[]).forEach((key) => {
    if (levelsCompleted >= BADGE_THRESHOLDS[key]) {
      earned.add(key);
    }
  });

  return earned;
}
