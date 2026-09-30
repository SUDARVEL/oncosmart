/**
 * Guided exercise video framing — Figma node 4319:5797 (390×844 screen).
 *
 * Video layer (4319:5801): **349 × 444**, radius 8, left inset 20.5.
 * Source portrait exports: **349 × 623** (taller).
 *
 * Fill the 349×444 window with `cover` + center so the clip keeps portrait
 * orientation and fills the frame (same as Figma). Empty headroom is trimmed;
 * the subject stays framed like the design comps.
 */

export const EXERCISE_SCREEN_DESIGN_WIDTH = 390;
export const EXERCISE_SCREEN_DESIGN_HEIGHT = 844;
/** Back-row top offset in Figma. */
export const EXERCISE_SCREEN_HEADER_TOP = 13;
export const EXERCISE_SCREEN_HEADER_HEIGHT = 40;
/** Content column left inset: (390 − 349) / 2 */
export const EXERCISE_CONTENT_LEFT_INSET = 20.5;
/** Gap between video (444) and copy block start (y=468) → 24px */
export const EXERCISE_VIDEO_TO_COPY_GAP = 24;

export const EXERCISE_VIDEO_SOURCE_WIDTH = 349;
export const EXERCISE_VIDEO_SOURCE_HEIGHT = 623;
export const EXERCISE_VIDEO_SOURCE_ASPECT =
  EXERCISE_VIDEO_SOURCE_WIDTH / EXERCISE_VIDEO_SOURCE_HEIGHT;

/** Figma video window (4319:5801). */
export const EXERCISE_VIDEO_FRAME_WIDTH = 349;
export const EXERCISE_VIDEO_FRAME_HEIGHT = 444;
export const CALF_RAISE_VIDEO_FRAME_HEIGHT = EXERCISE_VIDEO_FRAME_HEIGHT;
export const LEGACY_EXERCISE_VIDEO_FRAME_HEIGHT = 432;

export const EXERCISE_VIDEO_FRAME_ASPECT =
  EXERCISE_VIDEO_FRAME_WIDTH / EXERCISE_VIDEO_FRAME_HEIGHT;
export const EXERCISE_VIDEO_FRAME_BACKGROUND = '#E8E8E8';
/** Figma 4319:5801 — rounded-[16px] */
export const EXERCISE_VIDEO_FRAME_BORDER_RADIUS = 16;

export type GuidedVideoContentFit = 'contain' | 'cover' | 'fill';

export type GuidedVideoPresentation = {
  layout: 'portrait-crop' | 'fill-frame';
  contentFit: GuidedVideoContentFit;
  objectPosition: 'center bottom' | 'center' | `${string} ${string}`;
};

/**
 * Portrait source (349×623) → Figma window (349×444):
 * cover fills width, trims equal top/bottom headroom — matches Figma comps.
 */
const FIGMA_VIDEO_PRESENTATION: GuidedVideoPresentation = {
  layout: 'fill-frame',
  contentFit: 'cover',
  objectPosition: 'center',
};

export function isPathwayExerciseId(exerciseId: string): boolean {
  return exerciseId.startsWith('pathway-');
}

export function getGuidedVideoFrameHeight(_exerciseId: string): number {
  return EXERCISE_VIDEO_FRAME_HEIGHT;
}

export function getGuidedVideoFrameAspect(_exerciseId: string): number {
  return EXERCISE_VIDEO_FRAME_ASPECT;
}

export function getGuidedVideoPresentation(_exerciseId: string): GuidedVideoPresentation {
  return FIGMA_VIDEO_PRESENTATION;
}

/** Scale Figma 390-wide layout to the device. Never upscale past 1×. */
export function getExerciseScreenScale(screenWidth: number): number {
  if (!Number.isFinite(screenWidth) || screenWidth <= 0) return 1;
  return Math.min(1, screenWidth / EXERCISE_SCREEN_DESIGN_WIDTH);
}

/** Design video 349×444 scaled to the device. */
export function getScaledVideoFrameSize(screenWidth: number): {
  width: number;
  height: number;
  scale: number;
  contentWidth: number;
  contentLeftInset: number;
} {
  const scale = getExerciseScreenScale(screenWidth);
  return {
    scale,
    width: Math.round(EXERCISE_VIDEO_FRAME_WIDTH * scale),
    height: Math.round(EXERCISE_VIDEO_FRAME_HEIGHT * scale),
    contentWidth: Math.round(EXERCISE_VIDEO_FRAME_WIDTH * scale),
    contentLeftInset: Math.round(EXERCISE_CONTENT_LEFT_INSET * scale),
  };
}

export const HOME_DAY_CARD_PREVIEW_WIDTH = 343;
export const HOME_DAY_CARD_PREVIEW_HEIGHT = 193;
export const HOME_DAY_CARD_PREVIEW_ASPECT =
  HOME_DAY_CARD_PREVIEW_WIDTH / HOME_DAY_CARD_PREVIEW_HEIGHT;

export const HOME_DAY_CARD_WIDTH = 359;
export const HOME_DAY_CARD_HEIGHT = 300;

export const SESSION_EXERCISE_CARD_PREVIEW_WIDTH = 257;
export const SESSION_EXERCISE_CARD_PREVIEW_HEIGHT = 112;
export const SESSION_EXERCISE_CARD_PREVIEW_ASPECT =
  SESSION_EXERCISE_CARD_PREVIEW_WIDTH / SESSION_EXERCISE_CARD_PREVIEW_HEIGHT;
export const SESSION_EXERCISE_CARD_PREVIEW_BACKGROUND = '#FFFFFF';

export const SESSION_EXERCISE_CARD_HEIGHT = 180;
