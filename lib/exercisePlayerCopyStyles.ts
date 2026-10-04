import { Platform, StyleSheet } from 'react-native';

import { displayFontStyle, font } from '../theme/fonts';

/** Instruction line box. Tall enough for Tamil, tight enough to stay even. */
export const EXERCISE_DESCRIPTION_LINE_HEIGHT = 20;
/** “View more” row reserved so the pause button can stay on screen. */
export const EXERCISE_DESCRIPTION_MORE_HEIGHT = 32;

/**
 * Guided exercise copy typography (Figma node 2978:4976 family).
 * Copy uses the full scroll column width — never the narrower video frame width.
 */
export const exercisePlayerCopyStyles = StyleSheet.create({
  copyBlock: {
    alignSelf: 'stretch',
    width: '100%',
    marginTop: 0,
    alignItems: 'center',
    gap: 0,
  },
  titleWrap: {
    alignSelf: 'stretch',
    width: '100%',
    paddingTop: 2,
    paddingBottom: 2,
    overflow: 'visible',
  },
  /** Figma 4319:5807 — Roboto SemiBold 24 / 20 */
  exerciseTitle: {
    width: '100%',
    fontSize: 24,
    lineHeight: 28,
    color: '#262526',
    textAlign: 'center',
    letterSpacing: 0,
    flexShrink: 1,
    ...font('semiBold'),
    ...(Platform.OS === 'android'
      ? { includeFontPadding: true, textBreakStrategy: 'simple' as const }
      : {}),
  },
  repSection: {
    alignSelf: 'stretch',
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
    paddingVertical: 0,
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
  /** Figma 4319:5808 — Antonio Bold 64 */
  repValue: {
    fontSize: 64,
    lineHeight: 68,
    color: '#00131F',
    textAlign: 'center',
    flexShrink: 1,
    maxWidth: '100%',
    letterSpacing: 0.1,
    ...displayFontStyle(),
  },
  /** Figma 4319:5809 — Antonio Bold 36 */
  repLabel: {
    fontSize: 36,
    lineHeight: 40,
    color: '#00131F',
    marginBottom: Platform.OS === 'android' ? 8 : 6,
    flexShrink: 1,
    maxWidth: '100%',
    letterSpacing: 0.1,
    ...font('bold'),
  },
  /** Instruction under the rep count. Smaller so it sits with the full-size video. */
  descriptionWrap: {
    alignSelf: 'stretch',
    width: '100%',
    position: 'relative',
  },
  description: {
    marginTop: 2,
    width: '100%',
    letterSpacing: 0,
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: EXERCISE_DESCRIPTION_LINE_HEIGHT,
    ...font('regular'),
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  descriptionMeasure: {
    position: 'absolute',
    opacity: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  moreButton: {
    alignSelf: 'center',
    marginTop: 4,
    minHeight: EXERCISE_DESCRIPTION_MORE_HEIGHT,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  moreLabel: {
    color: '#005F99',
    letterSpacing: 0.15,
    fontSize: 13,
    lineHeight: 18,
    ...font('medium'),
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
});
