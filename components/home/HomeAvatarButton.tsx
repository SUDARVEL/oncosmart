import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { colors } from '../../theme/colors';

/** Onboarding Assets / Ellipse 15.svg — 64×64 white circle, #005F99 stroke. */
const ELLIPSE_15_XML = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="32" cy="32" r="31.5" fill="white" stroke="#005F99"/>
</svg>`;

const SIZE = 64;
/** Keep avatar inside the 1px stroke (r=31.5). */
const AVATAR_INSET = 1.5;

type Props = {
  source: number;
  onPress: () => void;
  accessibilityLabel: string;
};

/** Home header avatar — Ellipse 15 ring, opens choose-avatar screen. */
export function HomeAvatarButton({ source, onPress, accessibilityLabel }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.wrap}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <SvgXml xml={ELLIPSE_15_XML} width={SIZE} height={SIZE} />
      <View style={styles.avatarClip}>
        <Image
          source={source}
          style={styles.avatarImage}
          contentFit="cover"
          contentPosition="top"
          cachePolicy="memory-disk"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarClip: {
    position: 'absolute',
    top: AVATAR_INSET,
    left: AVATAR_INSET,
    right: AVATAR_INSET,
    bottom: AVATAR_INSET,
    borderRadius: (SIZE - AVATAR_INSET * 2) / 2,
    overflow: 'hidden',
    backgroundColor: colors.optionBgSelected,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
