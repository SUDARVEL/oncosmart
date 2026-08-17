import { Platform, StyleSheet } from 'react-native';

import { displayFontStyle, font } from '../theme/fonts';

/**
 * Guided exercise copy typography (Figma node 2978:4976 family).
 * Copy uses the full scroll column width — never the narrower video frame width.
 */
export const exercisePlayerCopyStyles = StyleSheet.create({
  copyBlock: {
    alignSelf: 'stretch',
    width: '100%',
    marginTop: 12,
    alignItems: 'center',
  },
  titleWrap: {
    alignSelf: 'stretch',
    width: '100%',
    paddingTop: 4,
    paddingBottom: 4,
    overflow: 'visible',
  },
  exerciseTitle: {
    width: '100%',
    fontSize: 18,
    lineHeight: 24,
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
    marginBottom: 20,
    paddingVertical: 2,
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
    marginTop: 4,
    width: '100%',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.1,
    color: '#6B7280',
    textAlign: 'center',
    ...font('regular'),
  },
});
