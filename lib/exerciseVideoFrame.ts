/**
 * Figma guided exercise video framing.
 *
 * Source composition (in Figma): 349 × 578
 * Visible crop window (in app UI): 349 × 444, radius 16
 *
 * The taller source is bottom-aligned inside the crop window so empty headroom
 * is trimmed from the top — arms/feet stay visible without stretching.
 *
 * Exception: dual-panel chest stretch fills the same 349×444 frame centered
 * (no bottom crop) so both stacked views stay visible.
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

export type GuidedVideoContentFit = 'contain' | 'cover' | 'fill';

export type GuidedVideoPresentation = {
  /** Default portrait instructor crop vs full-frame dual-panel (chest stretch). */
  layout: 'portrait-crop' | 'fill-frame';
  contentFit: GuidedVideoContentFit;
  objectPosition: 'center bottom' | 'center' | `${string} ${string}`;
  /** Zoom inside the crop window (>1 trims top chrome). */
  sourceScale?: number;
  /** Nudge video down (px) to hide baked-in top UI in specific assets. */
  sourceTranslateYPx?: number;
  /** Nudge video down as a fraction of the crop box height (responsive). */
  sourceTranslateYRatio?: number;
  /** Shift the tall source box down to crop more from the top (px, negative hides chrome). */
  sourceBoxBottomPx?: number;
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
 * Wall push-up portrait exports include baked-in slider chrome and extra headroom
 * (male + female, English + Tamil). Zoom, downward nudge, and source-box shift
 * keep the instructor framed like other exercises without clipping top UI.
 */
const WALL_PUSHUP_VIDEO_PRESENTATION: GuidedVideoPresentation = {
  layout: 'portrait-crop',
  contentFit: 'cover',
  objectPosition: 'center 96%',
  sourceScale: 1.2,
  sourceTranslateYRatio: 0.11,
  sourceBoxBottomPx: -54,
};

export function getGuidedVideoPresentation(exerciseId: string): GuidedVideoPresentation {
  if (exerciseId === 'chest-stretch') {
    return CHEST_STRETCH_VIDEO_PRESENTATION;
  }
  if (exerciseId === 'wall-pushup') {
    return WALL_PUSHUP_VIDEO_PRESENTATION;
  }
  return DEFAULT_GUIDED_VIDEO_PRESENTATION;
}

export function getGuidedVideoCropTranslateY(
  presentation: GuidedVideoPresentation,
  containerHeight = 0,
): number {
  if (presentation.sourceTranslateYPx != null) {
    return presentation.sourceTranslateYPx;
  }
  if (presentation.sourceTranslateYRatio != null && containerHeight > 0) {
    return containerHeight * presentation.sourceTranslateYRatio;
  }
  return 0;
}

export function getGuidedVideoTransformStyle(
  presentation: GuidedVideoPresentation,
  containerHeight = 0,
): { transform: ({ translateY: number } | { scale: number })[] } | undefined {
  const scale = presentation.sourceScale ?? 1;
  const translateY = getGuidedVideoCropTranslateY(presentation, containerHeight);
  if (scale === 1 && translateY === 0) return undefined;
  return { transform: [{ translateY }, { scale }] };
}

export function getGuidedVideoSourceBoxStyle(
  presentation: GuidedVideoPresentation,
): { bottom?: number } | undefined {
  if (presentation.sourceBoxBottomPx == null) return undefined;
  return { bottom: presentation.sourceBoxBottomPx };
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
