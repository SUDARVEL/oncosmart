import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
  COLLEGE_NAME_ASPECT,
  COLLEGE_NAME_XML,
} from '../lib/brand/collegeNameXml';

const MAX_FOOTER_WIDTH = 278;

/** Sri Ramachandra faculty branding — sharp SVG footer for the splash screen. */
export function SplashFooter() {
  const { width: windowWidth } = useWindowDimensions();
  const footerWidth = Math.min(MAX_FOOTER_WIDTH, Math.max(200, windowWidth - 112));
  const footerHeight = Math.round(footerWidth / COLLEGE_NAME_ASPECT);

  return (
    <View style={styles.container}>
      <View
        style={{ width: footerWidth, height: footerHeight }}
        accessibilityRole="image"
        accessibilityLabel="Sri Ramachandra Faculty of Physiotherapy"
      >
        <SvgXml
          xml={COLLEGE_NAME_XML}
          width={footerWidth}
          height={footerHeight}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 56,
    paddingBottom: 46,
  },
});
