import { Dimensions } from 'react-native';

import {
  EXERCISE_VIDEO_FRAME_HEIGHT,
  EXERCISE_VIDEO_FRAME_WIDTH,
} from './exerciseVideoFrame';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

/** Taller bottom sheet while keeping a strip of dimmed Growth screen above. */
export const WORKOUT_SHEET_MAX_HEIGHT = Math.round(SCREEN_HEIGHT * 0.92);
export const WORKOUT_SHEET_TOP_RADIUS = 24;

const SHEET_CHROME_HEIGHT = 128; // handle + header + divider + dots + padding
const AVAILABLE_BODY_HEIGHT = WORKOUT_SHEET_MAX_HEIGHT - SHEET_CHROME_HEIGHT;

/** Space for title, reps, and description — keep text above dots. */
export const WORKOUT_SLIDER_TEXT_BLOCK_HEIGHT = 210;

/** Inset media frame — uses extra sheet height for a larger exercise image. */
export const WORKOUT_SLIDER_MEDIA_WIDTH = Math.min(
  EXERCISE_VIDEO_FRAME_WIDTH,
  SCREEN_WIDTH - 32,
);

const idealMediaHeight = Math.round(
  WORKOUT_SLIDER_MEDIA_WIDTH * (EXERCISE_VIDEO_FRAME_HEIGHT / EXERCISE_VIDEO_FRAME_WIDTH),
);

export const WORKOUT_SLIDER_MEDIA_HEIGHT = Math.min(
  idealMediaHeight,
  AVAILABLE_BODY_HEIGHT - WORKOUT_SLIDER_TEXT_BLOCK_HEIGHT,
);

export const WORKOUT_SLIDER_MEDIA_RADIUS = 16;
/** Matches Figma light-gray media frame — never show black letterboxing. */
export const WORKOUT_SLIDER_MEDIA_BACKGROUND = '#F3F4F6';

export const WORKOUT_SLIDER_BODY_HEIGHT =
  WORKOUT_SLIDER_MEDIA_HEIGHT + WORKOUT_SLIDER_TEXT_BLOCK_HEIGHT;
