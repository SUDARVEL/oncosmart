import { Platform, type TextStyle } from 'react-native';

/**
 * Use the same family names registered by `useFonts` on every platform,
 * including Expo web / side preview (do not rely on Google Fonts CDN alone).
 */
const loadedFonts = {
  regular: 'Roboto_400Regular',
  medium: 'Roboto_500Medium',
  semiBold: 'Roboto_600SemiBold',
  bold: 'Roboto_700Bold',
} as const;

export const fonts = loadedFonts;

export const displayFont = Platform.select({
  web: 'Antonio_700Bold',
  default: 'Antonio_700Bold',
}) as string;

export type FontWeightName = keyof typeof loadedFonts;

export function font(weight: FontWeightName = 'regular'): TextStyle {
  return { fontFamily: fonts[weight] };
}

export function displayFontStyle(): TextStyle {
  return { fontFamily: displayFont };
}
