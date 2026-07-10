import { Dimensions } from 'react-native';

import {
  EXERCISE_VIDEO_FRAME_HEIGHT,
  EXERCISE_VIDEO_FRAME_WIDTH,
} from './exerciseVideoFrame';

const SCREEN_WIDTH = Dimensions.get('window').width;

/** Inset media frame matching Figma Exercise Info slides. */
export const WORKOUT_SLIDER_MEDIA_WIDTH = Math.min(
  EXERCISE_VIDEO_FRAME_WIDTH,
  SCREEN_WIDTH - 32,
);
export const WORKOUT_SLIDER_MEDIA_HEIGHT = Math.round(
  WORKOUT_SLIDER_MEDIA_WIDTH * (EXERCISE_VIDEO_FRAME_HEIGHT / EXERCISE_VIDEO_FRAME_WIDTH),
);
export const WORKOUT_SLIDER_MEDIA_RADIUS = 16;
export const WORKOUT_SLIDER_MEDIA_BACKGROUND = '#F3F4F6';

/** Space below media for title, reps, and description. */
export const WORKOUT_SLIDER_TEXT_BLOCK_HEIGHT = 260;

export const WORKOUT_SLIDER_BODY_HEIGHT =
  WORKOUT_SLIDER_MEDIA_HEIGHT + WORKOUT_SLIDER_TEXT_BLOCK_HEIGHT;
