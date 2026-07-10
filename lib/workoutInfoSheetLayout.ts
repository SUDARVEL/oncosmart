import { Dimensions } from 'react-native';

import {
  EXERCISE_VIDEO_FRAME_HEIGHT,
  EXERCISE_VIDEO_FRAME_WIDTH,
} from './exerciseVideoFrame';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

/** Bottom sheet should leave dimmed Growth screen visible above. */
export const WORKOUT_SHEET_MAX_HEIGHT = Math.round(SCREEN_HEIGHT * 0.88);
export const WORKOUT_SHEET_TOP_RADIUS = 24;

const SHEET_CHROME_HEIGHT = 130; // handle + header + divider + dots + padding
const AVAILABLE_BODY_HEIGHT = WORKOUT_SHEET_MAX_HEIGHT - SHEET_CHROME_HEIGHT;

/** Inset media frame — scaled to keep the sheet looking like a bottom drawer. */
export const WORKOUT_SLIDER_MEDIA_WIDTH = Math.min(
  EXERCISE_VIDEO_FRAME_WIDTH,
  SCREEN_WIDTH - 40,
);

const idealMediaHeight = Math.round(
  WORKOUT_SLIDER_MEDIA_WIDTH * (EXERCISE_VIDEO_FRAME_HEIGHT / EXERCISE_VIDEO_FRAME_WIDTH),
);

export const WORKOUT_SLIDER_TEXT_BLOCK_HEIGHT = 220;

export const WORKOUT_SLIDER_MEDIA_HEIGHT = Math.min(
  idealMediaHeight,
  AVAILABLE_BODY_HEIGHT - WORKOUT_SLIDER_TEXT_BLOCK_HEIGHT,
);

export const WORKOUT_SLIDER_MEDIA_RADIUS = 16;
export const WORKOUT_SLIDER_MEDIA_BACKGROUND = '#F3F4F6';

export const WORKOUT_SLIDER_BODY_HEIGHT =
  WORKOUT_SLIDER_MEDIA_HEIGHT + WORKOUT_SLIDER_TEXT_BLOCK_HEIGHT;
