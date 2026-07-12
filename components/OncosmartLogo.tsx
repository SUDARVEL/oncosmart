import { StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
  ONCOSMART_LOGO_ASPECT,
  ONCOSMART_LOGO_XML,
} from '../lib/brand/oncosmartLogoXml';
import { font } from '../theme/fonts';

/** Figma node 2914:7747 — ONCOSMART wordmark under the ribbon. */
const WORDMARK_COLOR = '#273573';
const ICON_TO_WORDMARK_GAP = 11;

type Props = {
  /** Ribbon icon width; height follows the SVG viewBox aspect ratio. */
  width?: number;
  /** When false, only the ribbon icon is shown. */
  showWordmark?: boolean;
};

/** Sharp vector OncoSmart lockup: ribbon + ONCOSMART wordmark (Figma splash). */
export function OncosmartLogo({ width = 82, showWordmark = true }: Props) {
  const iconHeight = Math.round(width / ONCOSMART_LOGO_ASPECT);

  return (
    <View
      style={styles.wrap}
      accessibilityRole="image"
      accessibilityLabel="OncoSmart"
    >
      <SvgXml
        xml={ONCOSMART_LOGO_XML}
        width={width}
        height={iconHeight}
      />
      {showWordmark ? (
        <Text style={styles.wordmark} numberOfLines={1}>
          ONCOSMART
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  wordmark: {
    marginTop: ICON_TO_WORDMARK_GAP,
    alignSelf: 'stretch',
    flexShrink: 0,
    fontSize: 16,
    color: WORDMARK_COLOR,
    textAlign: 'center',
    textTransform: 'uppercase',
    includeFontPadding: false,
    ...font('semiBold'),
  },
});
