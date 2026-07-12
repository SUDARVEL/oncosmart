import { Image, type ImageSource } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import type { AppAvatar } from '../../store/useAppStore';
import { colors } from '../../theme/colors';

/**
 * Onboarding Assets / Ellipse 15.svg — ring around home avatar.
 * Male face crop comes from Male Avatar DP Svg.svg framing.
 */
const ELLIPSE_15_XML = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="32" cy="32" r="31.5" fill="white" stroke="#005F99"/>
</svg>`;

const MALE_AVATAR_DP = require('../../assets/avatars/male-avatar-dp.png');

const SIZE = 64;
const AVATAR_INSET = 1.5;

type Props = {
  avatar: AppAvatar | null;
  /** Female (or fallback) full avatar image. */
  femaleSource: ImageSource;
  onPress: () => void;
  accessibilityLabel: string;
};

/** Home header avatar circle — Male DP Svg framing + Ellipse 15 ring. */
export function HomeAvatarButton({
  avatar,
  femaleSource,
  onPress,
  accessibilityLabel,
}: Props) {
  const source = avatar === 'female' ? femaleSource : MALE_AVATAR_DP;
  const contentPosition = avatar === 'female' ? 'top' : 'center';

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
          contentPosition={contentPosition}
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
