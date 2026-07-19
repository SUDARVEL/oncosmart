import { Dimensions } from 'react-native';

import {
  EXERCISE_VIDEO_FRAME_HEIGHT,
  EXERCISE_VIDEO_FRAME_WIDTH,
} from './exerciseVideoFrame';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

/** Taller sheet so description has clear space above pagination dots. */
export const WORKOUT_SHEET_MAX_HEIGHT = Math.round(SCREEN_HEIGHT * 0.94);
export const WORKOUT_SHEET_TOP_RADIUS = 24;

const SHEET_CHROME_HEIGHT = 148; // handle + header + divider + dots + padding
const AVAILABLE_BODY_HEIGHT = WORKOUT_SHEET_MAX_HEIGHT - SHEET_CHROME_HEIGHT;

/**
 * Reserved space for title + reps + description preview above dots.
 * Long Tamil copy scrolls inside each slide (WorkoutDetailSlide ScrollView).
 */
export const WORKOUT_SLIDER_TEXT_BLOCK_HEIGHT = 236;

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
/** Transparent — no grey frame behind slider photos. */
export const WORKOUT_SLIDER_MEDIA_BACKGROUND = 'transparent';

export const WORKOUT_SLIDER_BODY_HEIGHT =
  WORKOUT_SLIDER_MEDIA_HEIGHT + WORKOUT_SLIDER_TEXT_BLOCK_HEIGHT;
