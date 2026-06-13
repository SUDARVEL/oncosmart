export const fonts = {
  regular: 'Roboto_400Regular',
  medium: 'Roboto_500Medium',
  semiBold: 'Roboto_600SemiBold',
  bold: 'Roboto_700Bold',
} as const;

export type FontWeightName = keyof typeof fonts;

export function font(weight: FontWeightName = 'regular') {
  return { fontFamily: fonts[weight] };
}
