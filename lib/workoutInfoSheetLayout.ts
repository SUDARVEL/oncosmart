import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

/** Figma node 3165:5305 — workout detail bottom sheet */
export const WORKOUT_SHEET_FIGMA_WIDTH = 390;
export const WORKOUT_SHEET_FIGMA_HEIGHT = 772;
export const WORKOUT_SHEET_TOP_RADIUS = 16;

/**
 * Sheet height matches Figma 772 when the device can fit it;
 * otherwise leave a small gap above so the Growth screen peeks through.
 */
export const WORKOUT_SHEET_MAX_HEIGHT = Math.min(
  WORKOUT_SHEET_FIGMA_HEIGHT,
  Math.round(SCREEN_HEIGHT - 32),
);

/** Header row including title + close (Figma h=56). Handle sits inside this band. */
export const WORKOUT_SHEET_HEADER_HEIGHT = 56;

/** Pagination dots row under the pager */
export const WORKOUT_SHEET_DOTS_HEIGHT = 32;

/** Content region under the header (Figma h=716 on a 772 sheet). */
export const WORKOUT_SHEET_CONTENT_HEIGHT =
  WORKOUT_SHEET_MAX_HEIGHT - WORKOUT_SHEET_HEADER_HEIGHT;

/** Figma media frame: 349 × 446, radius 16, horizontal inset ~20.5 */
export const WORKOUT_SLIDER_MEDIA_RADIUS = 16;
export const WORKOUT_SLIDER_MEDIA_BACKGROUND = 'transparent';

const FIGMA_MEDIA_WIDTH = 349;
const FIGMA_MEDIA_HEIGHT = 446;
const FIGMA_MEDIA_HORIZONTAL_INSET = 20.5;
const FIGMA_MEDIA_TOP = 10.5;
const FIGMA_TEXT_BLOCK_HEIGHT = 248;

export const WORKOUT_SLIDER_MEDIA_WIDTH = Math.min(
  FIGMA_MEDIA_WIDTH,
  SCREEN_WIDTH - FIGMA_MEDIA_HORIZONTAL_INSET * 2,
);

const mediaScale = WORKOUT_SLIDER_MEDIA_WIDTH / FIGMA_MEDIA_WIDTH;

export const WORKOUT_SLIDER_MEDIA_TOP = Math.round(FIGMA_MEDIA_TOP * mediaScale);

/**
 * Reserved space for title + reps + description (Figma text block ~248).
 * Long Tamil copy scrolls inside each slide (WorkoutDetailSlide ScrollView).
 */
export const WORKOUT_SLIDER_TEXT_BLOCK_HEIGHT = Math.round(
  FIGMA_TEXT_BLOCK_HEIGHT * mediaScale,
);

/** Pager body = content minus dots (Figma content is 716; dots are app chrome). */
export const WORKOUT_SLIDER_BODY_HEIGHT =
  WORKOUT_SHEET_CONTENT_HEIGHT - WORKOUT_SHEET_DOTS_HEIGHT;

/**
 * Keep the exact Figma media aspect (349 × 446). Never clamp shorter — a shorter
 * frame would crop the character's legs/feet when the photo is drawn. The slide
 * lives inside a ScrollView, so any overflow scrolls instead of cropping.
 */
export const WORKOUT_SLIDER_MEDIA_HEIGHT = Math.round(
  FIGMA_MEDIA_HEIGHT * mediaScale,
);

/** Portrait frame ratio (width / height) enforced via aspectRatio for robustness. */
export const WORKOUT_SLIDER_MEDIA_ASPECT = FIGMA_MEDIA_WIDTH / FIGMA_MEDIA_HEIGHT;

/** SingleShadow-2: 0 4px 6px rgba(17, 24, 39, 0.20) */
export const WORKOUT_SHEET_SHADOW = {
  shadowColor: '#111827',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 6,
} as const;
