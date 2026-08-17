import { Platform, StyleSheet, type TextStyle } from 'react-native';

import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

/** Rep row height — Antonio 64px needs headroom on Android (glyphs draw outside line box). */
export const EXERCISE_REP_ROW_HEIGHT = Platform.OS === 'android' ? 96 : 88;

export const androidExerciseTextMetrics: TextStyle =
  Platform.OS === 'android' ? { includeFontPadding: false } : {};

export const exercisePlayerCopyStyles = StyleSheet.create({
  copyBlock: {
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 4,
  },
  exerciseTitle: {
    marginTop: 12,
    fontSize: 24,
    lineHeight: 28,
    color: '#262526',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.1,
    alignSelf: 'stretch',
    ...font('semiBold'),
    ...androidExerciseTextMetrics,
  },
  description: {
    marginTop: 4,
    paddingTop: 8,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
    color: '#6B7280',
    textAlign: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.background,
    zIndex: 2,
    ...font('regular'),
    ...androidExerciseTextMetrics,
  },
  repSection: {
    alignSelf: 'stretch',
    marginTop: 8,
    marginBottom: 12,
  },
  repRowClip: {
    height: EXERCISE_REP_ROW_HEIGHT,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  repRow: {
    height: EXERCISE_REP_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: Platform.OS === 'android' ? 10 : 8,
  },
  repValueClip: {
    height: EXERCISE_REP_ROW_HEIGHT,
    maxWidth: '72%',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  repValue: {
    fontSize: Platform.OS === 'android' ? 58 : 64,
    lineHeight: Platform.OS === 'android' ? 68 : 72,
    color: '#00131F',
    textAlign: 'center',
    ...androidExerciseTextMetrics,
  },
  repLabelClip: {
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  repLabel: {
    fontSize: 32,
    lineHeight: 40,
    color: '#00131F',
    ...font('bold'),
    ...androidExerciseTextMetrics,
  },
});
