import { getPublicStorageUrl } from './supabaseStorage';

/** Storage names in the Coach mark video folder. */
const COACH_MARK_VIDEO_PATHS = {
  en: 'Coach mark video/Oncosmart Tutorial Video New Version English(1).mp4',
  ta: 'Coach mark video/Oncosmart Tutorial Video New Version Tamil.mp4',
} as const;

export type CoachFilmChapter = {
  /** Seconds into the storage video where this beat starts. */
  start: number;
  titleKey: string;
};

/**
 * Shared beats in the English and Tamil coach films.
 * Both new recordings follow this walkthrough.
 */
export const COACH_FILM_CHAPTERS: CoachFilmChapter[] = [
  { start: 0, titleKey: 'coach.filmWelcomeTitle' },
  { start: 8, titleKey: 'coach.filmAvatarTitle' },
  { start: 24, titleKey: 'coach.filmSessionTitle' },
  { start: 64, titleKey: 'coach.filmStartTitle' },
  { start: 72, titleKey: 'coach.filmProgressTitle' },
  { start: 80, titleKey: 'coach.filmLevelsTitle' },
  { start: 90, titleKey: 'coach.filmPauseTitle' },
  { start: 120, titleKey: 'coach.filmWorkoutsTitle' },
  { start: 144, titleKey: 'coach.filmProfileTitle' },
  { start: 168, titleKey: 'coach.filmAllSetTitle' },
];

export function getCoachMarkVideoUrl(language: string | null | undefined): string | null {
  const path = language === 'ta' ? COACH_MARK_VIDEO_PATHS.ta : COACH_MARK_VIDEO_PATHS.en;
  return getPublicStorageUrl(path);
}

export function coachFilmChapterIndex(timeSeconds: number): number {
  let index = 0;
  for (let i = 0; i < COACH_FILM_CHAPTERS.length; i += 1) {
    if (timeSeconds + 0.05 >= COACH_FILM_CHAPTERS[i].start) index = i;
  }
  return index;
}
