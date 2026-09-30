/**
 * Guided exercise video framing — Figma zoom-to-fit in 349×444.
 *
 * Exact window:
 *   width: 349px; height: 444px; border-radius: 16px; flex-shrink: 0;
 *
 * Same as Figma: scale the clip to fill W×H (`cover` / zoom). The taller 9:16
 * source overflows top/bottom and is clipped by the frame — empty studio is
 * cropped, the figure stays fully visible and centered. Same for every exercise.
 */

export const EXERCISE_SCREEN_DESIGN_WIDTH = 390;
export const EXERCISE_SCREEN_DESIGN_HEIGHT = 844;
export const EXERCISE_SCREEN_HEADER_TOP = 13;
export const EXERCISE_SCREEN_HEADER_HEIGHT = 40;
export const EXERCISE_CONTENT_LEFT_INSET = 20.5;
/** Figma Frame 634958 — text + actions + media column */
export const EXERCISE_CONTENT_COLUMN_WIDTH = 349;
export const EXERCISE_VIDEO_TO_COPY_GAP = 24;
export const EXERCISE_ACTION_BUTTON_GAP = 16;

export const EXERCISE_VIDEO_SOURCE_WIDTH = 9;
export const EXERCISE_VIDEO_SOURCE_HEIGHT = 16;
export const EXERCISE_VIDEO_SOURCE_ASPECT =
  EXERCISE_VIDEO_SOURCE_WIDTH / EXERCISE_VIDEO_SOURCE_HEIGHT;

/** Figma guided player media — 349×444 (zoom-fit window). */
export const EXERCISE_VIDEO_FRAME_WIDTH = 349;
export const EXERCISE_VIDEO_FRAME_HEIGHT = 444;
export const CALF_RAISE_VIDEO_FRAME_HEIGHT = EXERCISE_VIDEO_FRAME_HEIGHT;
export const LEGACY_EXERCISE_VIDEO_FRAME_HEIGHT = 432;

export const EXERCISE_VIDEO_FRAME_ASPECT =
  EXERCISE_VIDEO_FRAME_WIDTH / EXERCISE_VIDEO_FRAME_HEIGHT;
/**
 * Studio wall from pathway MP4s (avg ~#E0E0E0). Shows while loading before
 * the zoomed clip paints edge-to-edge.
 */
export const EXERCISE_VIDEO_FRAME_BACKGROUND = '#E0E0E0';
export const EXERCISE_VIDEO_FRAME_BORDER_RADIUS = 16;

export type GuidedVideoContentFit = 'contain' | 'cover' | 'fill';

export type GuidedVideoPresentation = {
  layout: 'portrait-crop' | 'fill-frame';
  contentFit: GuidedVideoContentFit;
  objectPosition: 'center bottom' | 'center' | `${string} ${string}`;
};

/**
 * Figma zoom: cover the 349×444 window (scale to width, clip overflow height).
 * Center so head→feet stay in the visible crop — same for every clip.
 */
const FIGMA_ZOOM_PRESENTATION: GuidedVideoPresentation = {
  layout: 'fill-frame',
  contentFit: 'cover',
  objectPosition: 'center',
};

export function isPathwayExerciseId(exerciseId: string): boolean {
  return exerciseId.startsWith('pathway-');
}

/** Legacy `diaphragmatic-breathing` or pathway `…-sN-diaphragmatic-breathing`. */
export function isDiaphragmaticBreathingExercise(exerciseId: string): boolean {
  if (!exerciseId) return false;
  if (exerciseId === 'diaphragmatic-breathing') return true;
  if (exerciseId.endsWith('-diaphragmatic-breathing')) return true;
  return /\bdbe\b/i.test(exerciseId);
}

export function getGuidedVideoFrameHeight(_exerciseId: string): number {
  return EXERCISE_VIDEO_FRAME_HEIGHT;
}

export function getGuidedVideoFrameAspect(_exerciseId: string): number {
  return EXERCISE_VIDEO_FRAME_ASPECT;
}

export function getGuidedVideoPresentation(_exerciseId: string): GuidedVideoPresentation {
  return FIGMA_ZOOM_PRESENTATION;
}

export function getExerciseScreenScale(screenWidth: number): number {
  if (!Number.isFinite(screenWidth) || screenWidth <= 0) return 1;
  return Math.min(1, screenWidth / EXERCISE_SCREEN_DESIGN_WIDTH);
}

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
    contentWidth: Math.round(EXERCISE_CONTENT_COLUMN_WIDTH * scale),
    contentLeftInset: Math.round(EXERCISE_CONTENT_LEFT_INSET * scale),
  };
}

/**
 * Size of the 9:16 source when zoomed to cover `frameWidth`×`frameHeight`
 * (Figma: scale to fill width; height overflows and is clipped).
 */
export function getCoverVideoBox(
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
    // Source wider than frame — height-fill, width overflows
    const height = frameHeight;
    return { width: Math.round(height * sourceAspect), height };
  }
  // Source taller (9:16 in 349×444) — width-fill, height overflows (Figma zoom)
  const width = frameWidth;
  return { width, height: Math.round(width / sourceAspect) };
}

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
