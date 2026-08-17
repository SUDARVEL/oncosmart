import { Platform, StyleSheet } from 'react-native';

import { displayFontStyle, font } from '../theme/fonts';

/** Horizontal inset so long uppercase titles (e.g. DIAPHRAGMATIC BREATHING) never clip at edges. */
export const EXERCISE_COPY_HORIZONTAL_PADDING = 12;

/**
 * Guided exercise copy typography (Figma node 2978:4976 family).
 * Width is always 100% of the scroll column with horizontal padding — never a fixed pixel box.
 */
export const exercisePlayerCopyStyles = StyleSheet.create({
  copyBlock: {
    alignSelf: 'stretch',
    width: '100%',
    paddingHorizontal: EXERCISE_COPY_HORIZONTAL_PADDING,
    alignItems: 'center',
  },
  titleWrap: {
    alignSelf: 'stretch',
    width: '100%',
  },
  exerciseTitle: {
    marginTop: 12,
    width: '100%',
    fontSize: 22,
    lineHeight: 28,
    color: '#262526',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0,
    ...font('semiBold'),
  },
  repSection: {
    alignSelf: 'stretch',
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
    paddingVertical: 4,
  },
  repRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    maxWidth: '100%',
  },
  repValue: {
    fontSize: 52,
    lineHeight: 60,
    color: '#00131F',
    textAlign: 'center',
    flexShrink: 1,
    maxWidth: '100%',
    ...displayFontStyle(),
  },
  repLabel: {
    fontSize: 28,
    lineHeight: 36,
    color: '#00131F',
    marginBottom: Platform.OS === 'android' ? 8 : 6,
    flexShrink: 1,
    maxWidth: '100%',
    ...font('bold'),
  },
  description: {
    marginTop: 0,
    width: '100%',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.1,
    color: '#6B7280',
    textAlign: 'center',
    ...font('regular'),
  },
});
