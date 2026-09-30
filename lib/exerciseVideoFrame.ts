/**
 * Guided exercise video framing — Figma player window 349×444.
 *
 * Exact window:
 *   width: 349px; height: 444px; border-radius: 16px; flex-shrink: 0;
 *
 * Default: `contain` inside 349×444 so nothing is cut (studio grey pads gaps).
 * Diaphragmatic breathing (DB / DBE) only: `fill` stretches to the frame so the
 * clip covers 349×444 without cropping the body.
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

/** Figma guided player media — 349×444. */
export const EXERCISE_VIDEO_FRAME_WIDTH = 349;
export const EXERCISE_VIDEO_FRAME_HEIGHT = 444;
export const CALF_RAISE_VIDEO_FRAME_HEIGHT = EXERCISE_VIDEO_FRAME_HEIGHT;
export const LEGACY_EXERCISE_VIDEO_FRAME_HEIGHT = 432;

export const EXERCISE_VIDEO_FRAME_ASPECT =
  EXERCISE_VIDEO_FRAME_WIDTH / EXERCISE_VIDEO_FRAME_HEIGHT;
/**
 * Studio wall from pathway MP4s (avg ~#E0E0E0). Used as contain padding so
 * letterbox bars match the video instead of looking like a cut/white gap.
 */
export const EXERCISE_VIDEO_FRAME_BACKGROUND = '#E0E0E0';
export const EXERCISE_VIDEO_FRAME_BORDER_RADIUS = 16;

export type GuidedVideoContentFit = 'contain' | 'cover' | 'fill';

export type GuidedVideoPresentation = {
  layout: 'portrait-crop' | 'fill-frame';
  contentFit: GuidedVideoContentFit;
  objectPosition: 'center bottom' | 'center' | `${string} ${string}`;
};

/** Default — never crop face/body/legs. */
const CONTAIN_PRESENTATION: GuidedVideoPresentation = {
  layout: 'fill-frame',
  contentFit: 'contain',
  objectPosition: 'center',
};

/**
 * DB only — stretch into 349×444 (no crop). Slight aspect stretch is OK so the
 * seated breathing clip fills the Figma window edge-to-edge.
 */
const DB_STRETCH_PRESENTATION: GuidedVideoPresentation = {
  layout: 'fill-frame',
  contentFit: 'fill',
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

export function getGuidedVideoPresentation(exerciseId: string): GuidedVideoPresentation {
  if (isDiaphragmaticBreathingExercise(exerciseId)) {
    return DB_STRETCH_PRESENTATION;
  }
  return CONTAIN_PRESENTATION;
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
