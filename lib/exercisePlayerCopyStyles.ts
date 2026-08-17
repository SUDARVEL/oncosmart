import { Platform, StyleSheet, type TextStyle } from 'react-native';

import { displayFontStyle, font } from '../theme/fonts';

/** Fixed rep row — Antonio 64px must not bleed into the description below. */
export const EXERCISE_REP_ROW_HEIGHT = 80;

const androidTextMetrics: TextStyle =
  Platform.OS === 'android' ? { includeFontPadding: false } : {};

/**
 * Shared title / reps / description typography for guided exercise screens
 * and workout info slides. Keeps Android Antonio + Tamil labels from clipping.
 */
export const exercisePlayerCopyStyles = StyleSheet.create({
  copyBlock: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  exerciseTitle: {
    marginTop: 12,
    fontSize: 24,
    lineHeight: 28,
    color: '#262526',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.1,
    ...font('semiBold'),
    ...androidTextMetrics,
  },
  repRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    height: EXERCISE_REP_ROW_HEIGHT,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  repValue: {
    fontSize: 64,
    lineHeight: EXERCISE_REP_ROW_HEIGHT,
    color: '#00131F',
    ...displayFontStyle(),
    ...androidTextMetrics,
  },
  repLabel: {
    fontSize: 34,
    lineHeight: 44,
    color: '#00131F',
    ...font('bold'),
    ...androidTextMetrics,
  },
  description: {
    marginTop: 20,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
    color: '#6B7280',
    textAlign: 'center',
    alignSelf: 'stretch',
    ...font('regular'),
    ...androidTextMetrics,
  },
});
