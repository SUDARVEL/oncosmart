import levelsData from '../data/levels.json';
import type { AppAvatar, AppGender, AppLanguage } from '../store/useAppStore';
import { resolveVideoUrl } from './resolveVideoUrl';

export type VideoVariant = 'male-en' | 'male-ta' | 'female-en' | 'female-ta';

type LevelEntry = {
  day: number;
  titleKey: string;
  videos: Record<VideoVariant, string>;
};

const levels = levelsData.levels as LevelEntry[];

export function getVideoVariant(
  language: AppLanguage | null,
  gender: AppGender | null,
  avatar: AppAvatar | null,
): VideoVariant {
  const isFemale = avatar === 'female' || gender === 'female';
  const isTamil = language === 'ta';
  if (isFemale) return isTamil ? 'female-ta' : 'female-en';
  return isTamil ? 'male-ta' : 'male-en';
}

export function getExerciseVideoSource(
  day: number,
  language: AppLanguage | null,
  gender: AppGender | null,
  avatar: AppAvatar | null,
): string | null {
  const level = levels.find((entry) => entry.day === day);
  if (!level) return null;

  const variant = getVideoVariant(language, gender, avatar);
  const preferred = level.videos[variant]?.trim();
  if (preferred) return resolveVideoUrl(preferred);

  // Fallback: use any uploaded URL for this day (handy while testing with one video).
  const fallback = Object.values(level.videos).find((url) => url.trim().length > 0);
  return fallback ? resolveVideoUrl(fallback) : null;
}
