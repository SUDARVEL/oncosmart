/**
 * Figma guided exercise video framing.
 *
 * Source composition (in Figma): 349 × 578
 * Visible crop window (in app UI): 349 × 444, radius 16
 *
 * The taller source is bottom-aligned inside the crop window so empty headroom
 * is trimmed from the top — arms/feet stay visible without stretching.
 */
export const EXERCISE_VIDEO_SOURCE_WIDTH = 349;
export const EXERCISE_VIDEO_SOURCE_HEIGHT = 578;
export const EXERCISE_VIDEO_SOURCE_ASPECT =
  EXERCISE_VIDEO_SOURCE_WIDTH / EXERCISE_VIDEO_SOURCE_HEIGHT;

export const EXERCISE_VIDEO_FRAME_WIDTH = 349;
export const EXERCISE_VIDEO_FRAME_HEIGHT = 444;
export const EXERCISE_VIDEO_FRAME_ASPECT =
  EXERCISE_VIDEO_FRAME_WIDTH / EXERCISE_VIDEO_FRAME_HEIGHT;
export const EXERCISE_VIDEO_FRAME_BACKGROUND = '#FFFFFF';
export const EXERCISE_VIDEO_FRAME_BORDER_RADIUS = 16;

/**
 * Fill the tall source box (no letterbox), then the outer 349×444 window crops
 * overflow. Prefer cover so slight source aspect differences still fill cleanly.
 */
export const EXERCISE_VIDEO_CONTENT_FIT = 'cover' as const;
/** Anchor media to the bottom of the crop window (Figma cropper). */
export const EXERCISE_VIDEO_OBJECT_POSITION = 'center bottom' as const;

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
