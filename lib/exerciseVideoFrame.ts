/**
 * Guided exercise video framing — Figma node 2622:2437 (ONCOSMART).
 *
 * Visible video area: **349 × 444**, radius 8.
 * Source portrait exports: **349 × 623** (taller than the frame).
 *
 * Fit with `contain` + center so the full person is visible (no crop).
 * Extra vertical space letterboxes inside the rounded frame.
 */

export const EXERCISE_VIDEO_SOURCE_WIDTH = 349;
/** Original portrait export height (pathway / instructor MP4s). */
export const EXERCISE_VIDEO_SOURCE_HEIGHT = 623;
export const EXERCISE_VIDEO_SOURCE_ASPECT =
  EXERCISE_VIDEO_SOURCE_WIDTH / EXERCISE_VIDEO_SOURCE_HEIGHT;

/** Figma video window width (node 2622:2437). */
export const EXERCISE_VIDEO_FRAME_WIDTH = 349;
/** Figma video window height (node 2622:2437). */
export const EXERCISE_VIDEO_FRAME_HEIGHT = 444;
/** @deprecated Same as EXERCISE_VIDEO_FRAME_HEIGHT — kept for call sites. */
export const CALF_RAISE_VIDEO_FRAME_HEIGHT = EXERCISE_VIDEO_FRAME_HEIGHT;
/** Older short crop (unused for pathway). */
export const LEGACY_EXERCISE_VIDEO_FRAME_HEIGHT = 432;

export const EXERCISE_VIDEO_FRAME_ASPECT =
  EXERCISE_VIDEO_FRAME_WIDTH / EXERCISE_VIDEO_FRAME_HEIGHT;
/** Match Figma empty / letterbox area around contained video. */
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

/**
 * Default (and pathway): fill the 349×444 Figma window, show entire 349×623
 * clip with contain — no face/feet crop.
 */
const FIGMA_VIDEO_PRESENTATION: GuidedVideoPresentation = {
  layout: 'fill-frame',
  contentFit: 'contain',
  objectPosition: 'center',
};

/** Chest stretch stacked composition — same window, still no crop. */
const CHEST_STRETCH_VIDEO_PRESENTATION: GuidedVideoPresentation = {
  layout: 'fill-frame',
  contentFit: 'contain',
  objectPosition: 'center',
};

/**
 * Wall push-up square exports — still fit inside 349×444 without cropping
 * the instructor (letterbox OK).
 */
const WALL_PUSHUP_VIDEO_PRESENTATION: GuidedVideoPresentation = {
  layout: 'fill-frame',
  contentFit: 'contain',
  objectPosition: 'center',
};

const CALF_RAISE_VIDEO_PRESENTATION: GuidedVideoPresentation = {
  layout: 'fill-frame',
  contentFit: 'contain',
  objectPosition: 'center',
};

export function isPathwayExerciseId(exerciseId: string): boolean {
  return exerciseId.startsWith('pathway-');
}

/** Always the Figma 349×444 window (scaled by screen width in the player). */
export function getGuidedVideoFrameHeight(_exerciseId: string): number {
  return EXERCISE_VIDEO_FRAME_HEIGHT;
}

export function getGuidedVideoFrameAspect(exerciseId: string): number {
  return EXERCISE_VIDEO_FRAME_WIDTH / getGuidedVideoFrameHeight(exerciseId);
}

export function getGuidedVideoPresentation(exerciseId: string): GuidedVideoPresentation {
  if (exerciseId === 'chest-stretch') {
    return CHEST_STRETCH_VIDEO_PRESENTATION;
  }
  if (exerciseId === 'wall-pushup') {
    return WALL_PUSHUP_VIDEO_PRESENTATION;
  }
  if (exerciseId === 'calf-raise') {
    return CALF_RAISE_VIDEO_PRESENTATION;
  }
  // Pathway + default guided clips → Figma 349×444 contain.
  return FIGMA_VIDEO_PRESENTATION;
}

/** Home day-card video — full-bleed 16:9 inside the wide card. */
export const HOME_DAY_CARD_PREVIEW_WIDTH = 343;
export const HOME_DAY_CARD_PREVIEW_HEIGHT = 193;
export const HOME_DAY_CARD_PREVIEW_ASPECT =
  HOME_DAY_CARD_PREVIEW_WIDTH / HOME_DAY_CARD_PREVIEW_HEIGHT;

/** Home "Today's Exercise" card — nearly full screen width. */
export const HOME_DAY_CARD_WIDTH = 359;
export const HOME_DAY_CARD_HEIGHT = 300;

/** Session list exercise card — Figma 257×112 landscape preview. */
export const SESSION_EXERCISE_CARD_PREVIEW_WIDTH = 257;
export const SESSION_EXERCISE_CARD_PREVIEW_HEIGHT = 112;
export const SESSION_EXERCISE_CARD_PREVIEW_ASPECT =
  SESSION_EXERCISE_CARD_PREVIEW_WIDTH / SESSION_EXERCISE_CARD_PREVIEW_HEIGHT;
export const SESSION_EXERCISE_CARD_PREVIEW_BACKGROUND = '#FFFFFF';

/** Session list card shell — Figma height 180. */
export const SESSION_EXERCISE_CARD_HEIGHT = 180;
