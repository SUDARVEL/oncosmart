import { Platform, StyleSheet } from 'react-native';

import { displayFontStyle, font } from '../theme/fonts';
import { uiText } from '../theme/typography';

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
    paddingTop: 4,
    paddingBottom: 4,
    overflow: 'visible',
  },
  /** Figma 4319:5807 — Roboto SemiBold 24 / 20 */
  exerciseTitle: {
    width: '100%',
    fontSize: 24,
    lineHeight: 28,
    color: '#262526',
    textAlign: 'center',
    letterSpacing: 0.1,
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
    marginTop: 12,
    marginBottom: 12,
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
  description: {
    marginTop: 0,
    width: '100%',
    letterSpacing: 0.1,
    color: '#6B7280',
    textAlign: 'center',
    ...uiText(13),
  },
});
