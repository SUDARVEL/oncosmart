import { StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
  ONCOSMART_LOGO_ASPECT,
  ONCOSMART_LOGO_XML,
} from '../lib/brand/oncosmartLogoXml';
import { font } from '../theme/fonts';

/** Figma node 2914:7747 — ONCOSMART wordmark under the ribbon. */
const WORDMARK_WIDTH = 116;
const WORDMARK_COLOR = '#2C2C8A';
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
  },
  wordmark: {
    marginTop: ICON_TO_WORDMARK_GAP,
    width: WORDMARK_WIDTH,
    fontSize: 14,
    lineHeight: 15,
    color: WORDMARK_COLOR,
    textAlign: 'center',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    ...font('bold'),
  },
});
