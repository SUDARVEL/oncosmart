import { getPublicStorageUrl } from './supabaseStorage';

/** The only guided-tour film in storage. English and Tamil share this recording. */
const COACH_MARK_VIDEO_PATH =
  'Coach mark video/WhatsApp Video 2026-10-04 at 11.36.22 AM.mp4';

export type CoachFilmChapter = {
  /** Seconds into the storage video where this beat starts. */
  start: number;
  titleKey: string;
};

/**
 * Beats inside the Coach mark video, in the order the recording plays them.
 * Times come from the 2:32 film itself.
 */
export const COACH_FILM_CHAPTERS: CoachFilmChapter[] = [
  { start: 0, titleKey: 'coach.filmWelcomeTitle' },
  { start: 8, titleKey: 'coach.filmAvatarTitle' },
  { start: 16, titleKey: 'coach.filmSessionTitle' },
  { start: 32, titleKey: 'coach.filmStartTitle' },
  { start: 56, titleKey: 'coach.filmProgressTitle' },
  { start: 72, titleKey: 'coach.filmLevelsTitle' },
  { start: 96, titleKey: 'coach.filmWorkoutsTitle' },
  { start: 120, titleKey: 'coach.filmProfileTitle' },
  { start: 144, titleKey: 'coach.filmAllSetTitle' },
];

export function getCoachMarkVideoUrl(): string | null {
  return getPublicStorageUrl(COACH_MARK_VIDEO_PATH);
}

export function coachFilmChapterIndex(timeSeconds: number): number {
  let index = 0;
  for (let i = 0; i < COACH_FILM_CHAPTERS.length; i += 1) {
    if (timeSeconds + 0.05 >= COACH_FILM_CHAPTERS[i].start) index = i;
  }
  return index;
}
