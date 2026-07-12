import type { ImageSource } from 'expo-image';

import type { BadgeKey } from './getEarnedBadges';

const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

const BADGE_SVG_FOLDER = 'Svg For Badges';

/** Exact Supabase filenames for Growth badges (100×100). */
const BADGE_SVG_FILES: Partial<Record<BadgeKey, string>> = {
  startup: 'Start up champion Badge 100x100.svg',
  consistent: 'Consistent Star Badge 100x 100.svg',
  strength: 'Strength Builder Badge 100x100.svg',
  hero: 'Functional Hero 100x100.svg',
  unstoppable: 'The Unstoppable 100x100.svg',
};

function encodeObjectPath(objectPath: string): string {
  return objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function getBadgeIconSource(badgeKey: BadgeKey): ImageSource | null {
  const file = BADGE_SVG_FILES[badgeKey];
  if (!file) return null;

  const objectPath = `${BADGE_SVG_FOLDER}/${file}`;
  return { uri: `${SUPABASE_PUBLIC_BASE}/${encodeObjectPath(objectPath)}` };
}
