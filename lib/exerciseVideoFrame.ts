/**
 * Guided exercise video framing — ONCOSMART Figma.
 *
 * Screen column (iPhone design): 390 × 844, padding 13/65, gap 11, centered.
 * Video layer (e.g. node 4319:5766): **349 × 445**, radius 8.
 * Source portrait exports: **349 × 623** (taller than the frame).
 *
 * Always `contain` + center so the full person is visible (no crop / no stretch).
 */

/** Figma artboard width for the exercise screen. */
export const EXERCISE_SCREEN_DESIGN_WIDTH = 390;
/** Figma artboard height for the exercise screen. */
export const EXERCISE_SCREEN_DESIGN_HEIGHT = 844;
export const EXERCISE_SCREEN_PADDING_TOP = 13;
export const EXERCISE_SCREEN_PADDING_BOTTOM = 65;
export const EXERCISE_SCREEN_GAP = 11;

export const EXERCISE_VIDEO_SOURCE_WIDTH = 349;
/** Original portrait export height (pathway / instructor MP4s). */
export const EXERCISE_VIDEO_SOURCE_HEIGHT = 623;
export const EXERCISE_VIDEO_SOURCE_ASPECT =
  EXERCISE_VIDEO_SOURCE_WIDTH / EXERCISE_VIDEO_SOURCE_HEIGHT;

/** Figma video window width (node 4319:5766). */
export const EXERCISE_VIDEO_FRAME_WIDTH = 349;
/** Figma video window height (node 4319:5766 ≈ 445). */
export const EXERCISE_VIDEO_FRAME_HEIGHT = 445;
/** @deprecated Alias — same as EXERCISE_VIDEO_FRAME_HEIGHT. */
export const CALF_RAISE_VIDEO_FRAME_HEIGHT = EXERCISE_VIDEO_FRAME_HEIGHT;
export const LEGACY_EXERCISE_VIDEO_FRAME_HEIGHT = 432;

export const EXERCISE_VIDEO_FRAME_ASPECT =
  EXERCISE_VIDEO_FRAME_WIDTH / EXERCISE_VIDEO_FRAME_HEIGHT;
export const EXERCISE_VIDEO_FRAME_BACKGROUND = '#FFFFFF';
export const EXERCISE_VIDEO_FRAME_BORDER_RADIUS = 8;

export const EXERCISE_VIDEO_CONTENT_FIT = 'contain' as const;
export const EXERCISE_VIDEO_OBJECT_POSITION = 'center' as const;

export type GuidedVideoContentFit = 'contain' | 'cover' | 'fill';

export type GuidedVideoPresentation = {
  layout: 'portrait-crop' | 'fill-frame';
  contentFit: GuidedVideoContentFit;
  objectPosition: 'center bottom' | 'center' | `${string} ${string}`;
};

/** Fit entire source inside the 349×445 window — never crop or stretch. */
const FIGMA_VIDEO_PRESENTATION: GuidedVideoPresentation = {
  layout: 'fill-frame',
  contentFit: 'contain',
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

/**
 * Scale Figma 390-wide layout to the device. Never upscale past 1×.
 * Returns the factor to multiply design px values.
 */
export function getExerciseScreenScale(screenWidth: number): number {
  if (!Number.isFinite(screenWidth) || screenWidth <= 0) return 1;
  return Math.min(1, screenWidth / EXERCISE_SCREEN_DESIGN_WIDTH);
}

/** Design video width scaled to the device (fits the 390 column). */
export function getScaledVideoFrameSize(screenWidth: number): {
  width: number;
  height: number;
  scale: number;
} {
  const scale = getExerciseScreenScale(screenWidth);
  const width = Math.round(EXERCISE_VIDEO_FRAME_WIDTH * scale);
  const height = Math.round(EXERCISE_VIDEO_FRAME_HEIGHT * scale);
  return { width, height, scale };
}

/** Home day-card video — full-bleed 16:9 inside the wide card. */
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
