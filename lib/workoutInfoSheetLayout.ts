import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Full-bleed slider image — matches Figma edge-to-edge media with rounded bottom. */
export const WORKOUT_SLIDER_IMAGE_WIDTH = SCREEN_WIDTH;
export const WORKOUT_SLIDER_IMAGE_HEIGHT = Math.min(
  Math.round(SCREEN_WIDTH * (444 / 349)),
  Math.round(SCREEN_HEIGHT * 0.48),
);
export const WORKOUT_SLIDER_IMAGE_BOTTOM_RADIUS = 24;
