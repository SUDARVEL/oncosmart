import type { AppAvatar, AppGender } from '../store/useAppStore';

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
  /**
   * Multiply the Figma source-box height before bottom-align clip.
   * >1 zooms in and hides top chrome (layout clip — works on Android VideoView).
   */
  sourceBoxHeightScale?: number;
  /** Horizontal bleed so rounded corners stay filled (layout clip). */
  sourceBoxWidthScale?: number;
  /** Hide ExoPlayer scrubber chrome that can flash over the video on Android. */
  requiresLinearPlayback?: boolean;
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
 * Wall push-up exports embed slider/arrow chrome and extra headroom (female).
 * Bottom-aligned source box + cover fills the frame on Android without transforms.
 */
const WALL_PUSHUP_MALE_PRESENTATION: GuidedVideoPresentation = {
  layout: 'portrait-crop',
  contentFit: 'cover',
  objectPosition: 'center bottom',
  sourceBoxHeightScale: 1.14,
  sourceBoxWidthScale: 1.08,
  requiresLinearPlayback: true,
};

const WALL_PUSHUP_FEMALE_PRESENTATION: GuidedVideoPresentation = {
  layout: 'portrait-crop',
  contentFit: 'cover',
  objectPosition: 'center bottom',
  sourceBoxHeightScale: 1.28,
  sourceBoxWidthScale: 1.08,
  requiresLinearPlayback: true,
};

function isFemaleMediaTrack(
  gender: AppGender | null,
  avatar: AppAvatar | null,
): boolean {
  return avatar === 'female' || gender === 'female';
}

export function getGuidedVideoPresentation(
  exerciseId: string,
  gender: AppGender | null = null,
  avatar: AppAvatar | null = null,
): GuidedVideoPresentation {
  if (exerciseId === 'chest-stretch') {
    return CHEST_STRETCH_VIDEO_PRESENTATION;
  }
  if (exerciseId === 'wall-pushup') {
    return isFemaleMediaTrack(gender, avatar)
      ? WALL_PUSHUP_FEMALE_PRESENTATION
      : WALL_PUSHUP_MALE_PRESENTATION;
  }
  return DEFAULT_GUIDED_VIDEO_PRESENTATION;
}

/** Height of the bottom-aligned source box inside the 349×444 frame (px). */
export function getGuidedVideoSourceBoxHeight(
  presentation: GuidedVideoPresentation,
  frameHeight: number,
): number {
  const scale = presentation.sourceBoxHeightScale ?? 1;
  return (
    (EXERCISE_VIDEO_SOURCE_HEIGHT / EXERCISE_VIDEO_FRAME_HEIGHT) * frameHeight * scale
  );
}

export type GuidedVideoSourceBoxLayoutStyle = {
  position: 'absolute';
  left: number;
  bottom: 0;
  width: number;
  height: number;
};

export function getGuidedVideoSourceBoxLayoutStyle(
  presentation: GuidedVideoPresentation,
  frameWidth: number,
  frameHeight: number,
): GuidedVideoSourceBoxLayoutStyle | { width: '100%'; height: '100%' } {
  if (presentation.layout === 'fill-frame') {
    return { width: '100%', height: '100%' };
  }

  const widthScale = presentation.sourceBoxWidthScale ?? 1;
  const width = frameWidth * widthScale;
  const left = -((width - frameWidth) / 2);

  return {
    position: 'absolute',
    left,
    bottom: 0,
    width,
    height: getGuidedVideoSourceBoxHeight(presentation, frameHeight),
  };
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
