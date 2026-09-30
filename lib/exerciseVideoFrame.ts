/**
 * Guided exercise video framing — Figma node 4319:5797 (390×844 screen).
 *
 * Video layer (4319:5801): **349 × 444**, radius 8, left inset 20.5.
 * Real pathway MP4s are **9:16** (e.g. 1080×1920) — taller than the window.
 *
 * Letterbox an explicit **9:16** box inside 349×444 (CSS contain math) so the
 * entire person (head → shoes) stays visible. Native contentFit alone is not
 * trusted on Android SurfaceView (it can zoom and crop the head).
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
/** Clear separation between Pause and Restart. */
export const EXERCISE_ACTION_BUTTON_GAP = 20;

/** Native pathway clips are 9:16 (1080×1920 / 2160×3840). */
export const EXERCISE_VIDEO_SOURCE_WIDTH = 9;
export const EXERCISE_VIDEO_SOURCE_HEIGHT = 16;
export const EXERCISE_VIDEO_SOURCE_ASPECT =
  EXERCISE_VIDEO_SOURCE_WIDTH / EXERCISE_VIDEO_SOURCE_HEIGHT;

/** Figma video window (4319:5801). */
export const EXERCISE_VIDEO_FRAME_WIDTH = 349;
export const EXERCISE_VIDEO_FRAME_HEIGHT = 444;
export const CALF_RAISE_VIDEO_FRAME_HEIGHT = EXERCISE_VIDEO_FRAME_HEIGHT;
export const LEGACY_EXERCISE_VIDEO_FRAME_HEIGHT = 432;

export const EXERCISE_VIDEO_FRAME_ASPECT =
  EXERCISE_VIDEO_FRAME_WIDTH / EXERCISE_VIDEO_FRAME_HEIGHT;
/** Matches studio wash so contain letterbox blends with the clip. */
export const EXERCISE_VIDEO_FRAME_BACKGROUND = '#E8E8E8';
export const EXERCISE_VIDEO_FRAME_BORDER_RADIUS = 8;
export const EXERCISE_VIDEO_FRAME_BORDER_COLOR = '#D1D5DB';
export const EXERCISE_VIDEO_FRAME_BORDER_WIDTH = 1;

export type GuidedVideoContentFit = 'contain' | 'cover' | 'fill';

export type GuidedVideoPresentation = {
  layout: 'portrait-crop' | 'fill-frame';
  contentFit: GuidedVideoContentFit;
  objectPosition: 'center bottom' | 'center' | `${string} ${string}`;
};

/**
 * 9:16 source → 349×444 window: contain shows the full figure, never crops.
 */
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

/**
 * Size a source-aspect rectangle that fits entirely inside the frame (CSS contain).
 * Used to letterbox 9:16 clips inside 349×444 without relying on native contentFit.
 */
export function getContainedVideoBox(
  frameWidth: number,
  frameHeight: number,
  sourceAspect: number = EXERCISE_VIDEO_SOURCE_ASPECT,
): { width: number; height: number } {
  if (
    !Number.isFinite(frameWidth) ||
    !Number.isFinite(frameHeight) ||
    frameWidth <= 0 ||
    frameHeight <= 0 ||
    !Number.isFinite(sourceAspect) ||
    sourceAspect <= 0
  ) {
    return { width: 0, height: 0 };
  }
  const frameAspect = frameWidth / frameHeight;
  if (sourceAspect >= frameAspect) {
    const width = frameWidth;
    return { width, height: Math.round(width / sourceAspect) };
  }
  const height = frameHeight;
  return { width: Math.round(height * sourceAspect), height };
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
