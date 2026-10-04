import { getPublicStorageUrl } from './supabaseStorage';

/** Storage names. The Tamil file keeps the space before “.mp4”. */
const COACH_MARK_VIDEO_PATHS = {
  en: 'Coach mark video/English.mp4',
  ta: 'Coach mark video/Tamil .mp4',
} as const;

export type CoachFilmChapter = {
  /** Seconds into the storage video where this beat starts. */
  start: number;
  titleKey: string;
};

/**
 * Shared beats in the English and Tamil Coach mark films.
 * Both recordings run the same walkthrough at these times.
 */
export const COACH_FILM_CHAPTERS: CoachFilmChapter[] = [
  { start: 0, titleKey: 'coach.filmWelcomeTitle' },
  { start: 8, titleKey: 'coach.filmAvatarTitle' },
  { start: 20, titleKey: 'coach.filmSessionTitle' },
  { start: 32, titleKey: 'coach.filmStartTitle' },
  { start: 56, titleKey: 'coach.filmProgressTitle' },
  { start: 64, titleKey: 'coach.filmLevelsTitle' },
  { start: 100, titleKey: 'coach.filmWorkoutsTitle' },
  { start: 128, titleKey: 'coach.filmProfileTitle' },
  { start: 148, titleKey: 'coach.filmAllSetTitle' },
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
