/**
 * Figma guided exercise video framing.
 *
 * Source composition (in Figma): 349 × 578
 * Visible crop window (in app UI): 349 × 432, radius 16  (node 2978:4962)
 *
 * The taller source is bottom-aligned inside the crop window so empty headroom
 * is trimmed from the top — arms/feet stay visible without stretching.
 *
 * Exception: dual-panel chest stretch fills the same 349×432 frame centered
 * (no bottom crop) so both stacked views stay visible.
 *
 * Wall push-up portrait MP4s are square (1080×1080) with baked-in margins.
 * Fill the visible frame directly (fill-frame + cover) so Android VideoView
 * does not letterbox inside a taller source box.
 */
export const EXERCISE_VIDEO_SOURCE_WIDTH = 349;
export const EXERCISE_VIDEO_SOURCE_HEIGHT = 578;
export const EXERCISE_VIDEO_SOURCE_ASPECT =
  EXERCISE_VIDEO_SOURCE_WIDTH / EXERCISE_VIDEO_SOURCE_HEIGHT;

export const EXERCISE_VIDEO_FRAME_WIDTH = 349;
/** Default guided player crop height (most portrait exercises). */
export const EXERCISE_VIDEO_FRAME_HEIGHT = 432;
/** Figma Calf Raises image frame (node 2978:4980). */
export const CALF_RAISE_VIDEO_FRAME_HEIGHT = 444;
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

export type GuidedVideoContentFit = 'contain' | 'cover' | 'fill';

export type GuidedVideoPresentation = {
  /** Default portrait instructor crop vs full-frame dual-panel (chest stretch). */
  layout: 'portrait-crop' | 'fill-frame';
  contentFit: GuidedVideoContentFit;
  objectPosition: 'center bottom' | 'center' | `${string} ${string}`;
};

const DEFAULT_GUIDED_VIDEO_PRESENTATION: GuidedVideoPresentation = {
  layout: 'portrait-crop',
  contentFit: EXERCISE_VIDEO_CONTENT_FIT,
  objectPosition: EXERCISE_VIDEO_OBJECT_POSITION,
};

/** Chest stretch is a stacked front/back composition — show the full frame. */
const CHEST_STRETCH_VIDEO_PRESENTATION: GuidedVideoPresentation = {
  layout: 'fill-frame',
  contentFit: 'contain',
  objectPosition: 'center',
};

/**
 * Wall push-up square exports — fill the Figma 349×432 window edge-to-edge.
 * Same presentation for male/female and English/Tamil (asset shape, not gender).
 */
const WALL_PUSHUP_VIDEO_PRESENTATION: GuidedVideoPresentation = {
  layout: 'fill-frame',
  contentFit: 'cover',
  objectPosition: 'center bottom',
};

/**
 * Calf raise portrait MP4s include baked-in side margins (Figma node 2978:4980).
 * Fill the 349×444 frame edge-to-edge — same for all genders/languages.
 */
const CALF_RAISE_VIDEO_PRESENTATION: GuidedVideoPresentation = {
  layout: 'fill-frame',
  contentFit: 'cover',
  objectPosition: 'center bottom',
};

export function getGuidedVideoFrameHeight(exerciseId: string): number {
  if (exerciseId === 'calf-raise') {
    return CALF_RAISE_VIDEO_FRAME_HEIGHT;
  }
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
  return DEFAULT_GUIDED_VIDEO_PRESENTATION;
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
