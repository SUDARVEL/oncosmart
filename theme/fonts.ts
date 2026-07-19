import { Platform, type TextStyle } from 'react-native';

/**
 * Use the same family names registered by `useFonts` on every platform,
 * including Expo web / side preview (do not rely on Google Fonts CDN alone).
 *
 * Roboto is the Latin UI face from Figma English screens. Noto Sans Tamil is
 * loaded for Tamil High Fidelity copy — Roboto does not include Tamil glyphs.
 */
const robotoFonts = {
  regular: 'Roboto_400Regular',
  medium: 'Roboto_500Medium',
  semiBold: 'Roboto_600SemiBold',
  bold: 'Roboto_700Bold',
} as const;

const tamilFonts = {
  regular: 'NotoSansTamil_400Regular',
  medium: 'NotoSansTamil_500Medium',
  semiBold: 'NotoSansTamil_600SemiBold',
  bold: 'NotoSansTamil_700Bold',
} as const;

export type FontWeightName = keyof typeof robotoFonts;

export const fonts = robotoFonts;

export const displayFont = Platform.select({
  web: 'Antonio_700Bold',
  default: 'Antonio_700Bold',
}) as string;

/**
 * On web, stack Roboto then Noto so Latin keeps Roboto metrics and Tamil
 * codepoints fall through. On native, custom fonts do not glyph-fallback, so
 * Noto Sans Tamil is used (it includes the Latin characters this app needs).
 */
export function font(weight: FontWeightName = 'regular'): TextStyle {
  const roboto = robotoFonts[weight];
  const tamil = tamilFonts[weight];

  if (Platform.OS === 'web') {
    return { fontFamily: `${roboto}, ${tamil}, sans-serif` };
  }

  return { fontFamily: tamil };
}

export function displayFontStyle(): TextStyle {
  return { fontFamily: displayFont };
}
