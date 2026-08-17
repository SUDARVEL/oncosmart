import { Platform, StyleSheet } from 'react-native';

import { displayFontStyle, font } from '../theme/fonts';

/**
 * Guided exercise copy typography (Figma node 2978:4976 family).
 * No overflow clipping — Android Antonio/Noto glyphs need natural line boxes.
 */
export const exercisePlayerCopyStyles = StyleSheet.create({
  copyBlock: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  exerciseTitle: {
    marginTop: 12,
    fontSize: 24,
    lineHeight: 32,
    color: '#262526',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.1,
    alignSelf: 'stretch',
    ...font('semiBold'),
  },
  repSection: {
    alignSelf: 'stretch',
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
    maxWidth: '100%',
  },
  repValue: {
    fontSize: 56,
    lineHeight: 64,
    color: '#00131F',
    textAlign: 'center',
    flexShrink: 0,
    ...displayFontStyle(),
  },
  repLabel: {
    fontSize: 30,
    lineHeight: 38,
    color: '#00131F',
    marginBottom: Platform.OS === 'android' ? 10 : 8,
    flexShrink: 0,
    ...font('bold'),
  },
  description: {
    marginTop: 0,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.1,
    color: '#6B7280',
    textAlign: 'center',
    alignSelf: 'stretch',
    ...font('regular'),
  },
});
