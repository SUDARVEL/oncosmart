import { Platform, type TextStyle } from 'react-native';

const nativeFonts = {
  regular: 'Roboto_400Regular',
  medium: 'Roboto_500Medium',
  semiBold: 'Roboto_600SemiBold',
  bold: 'Roboto_700Bold',
} as const;

const webFonts = {
  regular: 'Roboto',
  medium: 'Roboto',
  semiBold: 'Roboto',
  bold: 'Roboto',
} as const;

export const fonts = Platform.OS === 'web' ? webFonts : nativeFonts;

export const displayFont = Platform.select({
  web: 'Antonio',
  default: 'Antonio_700Bold',
}) as string;

export type FontWeightName = keyof typeof nativeFonts;

const webFontWeights: Record<FontWeightName, NonNullable<TextStyle['fontWeight']>> = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};

export function font(weight: FontWeightName = 'regular'): TextStyle {
  if (Platform.OS === 'web') {
    return {
      fontFamily: fonts[weight],
      fontWeight: webFontWeights[weight],
    };
  }

  return { fontFamily: fonts[weight] };
}

export function displayFontStyle(): TextStyle {
  if (Platform.OS === 'web') {
    return {
      fontFamily: displayFont,
      fontWeight: '700',
    };
  }

  return { fontFamily: displayFont };
}
