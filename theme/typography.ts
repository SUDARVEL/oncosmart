import { Platform, type TextStyle } from 'react-native';

import { colors } from './colors';
import { font, type FontWeightName } from './fonts';

/**
 * Noto Sans Tamil glyphs need a taller line box than Latin Roboto.
 * lineHeight ≈ fontSize clips descenders/combining marks on Android.
 */
export function tamilLineHeight(fontSize: number): number {
  return Math.round(fontSize * 1.45);
}

/** Body / label text that won't clip Tamil. */
export function uiText(
  fontSize: number,
  weight: FontWeightName = 'regular',
): TextStyle {
  return {
    fontSize,
    lineHeight: tamilLineHeight(fontSize),
    ...font(weight),
    ...(Platform.OS === 'android' ? { includeFontPadding: true } : null),
  };
}

/**
 * Shared TextInput style.
 * On Android avoid lineHeight + includeFontPadding together — that causes
 * placeholder "ghost second line" / clipping with Tamil.
 */
export const textFieldStyle: TextStyle = {
  height: 56,
  borderWidth: 1,
  borderColor: colors.inputBorder,
  borderRadius: 8,
  paddingHorizontal: 14,
  ...(Platform.OS === 'android'
    ? {
        paddingTop: 0,
        paddingBottom: 0,
        includeFontPadding: false,
        textAlignVertical: 'center' as const,
      }
    : {
        paddingVertical: 14,
      }),
  fontSize: 16,
  ...font('regular'),
  color: colors.textPrimary,
  backgroundColor: colors.background,
};
