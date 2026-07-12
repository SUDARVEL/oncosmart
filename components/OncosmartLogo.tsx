import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
  ONCOSMART_LOGO_ASPECT,
  ONCOSMART_LOGO_XML,
} from '../lib/brand/oncosmartLogoXml';

type Props = {
  /** Display width; height follows the SVG viewBox aspect ratio. */
  width?: number;
  height?: number;
};

/** Sharp vector OncoSmart wordmark for splash / onboarding. */
export function OncosmartLogo({ width = 116, height }: Props) {
  const resolvedHeight = height ?? Math.round(width / ONCOSMART_LOGO_ASPECT);

  return (
    <View
      style={[styles.wrap, { width, height: resolvedHeight }]}
      accessibilityRole="image"
      accessibilityLabel="OncoSmart"
    >
      <SvgXml
        xml={ONCOSMART_LOGO_XML}
        width={width}
        height={resolvedHeight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
