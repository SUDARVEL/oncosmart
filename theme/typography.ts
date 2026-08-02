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
 * Shared TextInput style — taller field + vertical padding so Tamil
 * placeholders and typed text are never cut off at the bottom.
 */
export const textFieldStyle: TextStyle = {
  minHeight: 56,
  borderWidth: 1,
  borderColor: colors.inputBorder,
  borderRadius: 8,
  paddingHorizontal: 14,
  paddingTop: 14,
  paddingBottom: 14,
  fontSize: 16,
  lineHeight: 24,
  ...font('regular'),
  color: colors.textPrimary,
  backgroundColor: colors.background,
  textAlignVertical: 'center',
  ...(Platform.OS === 'android' ? { includeFontPadding: true } : null),
};
