import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import type { AppAvatar } from '../../store/useAppStore';
import { PressableScale } from '../PressableScale';
import { colors } from '../../theme/colors';

/**
 * Onboarding Assets / Ellipse 15.svg — ring around home avatar (male).
 * Female DP follows Figma 2910:5246 + Supabase Home page/Female Avatar DP 1.svg.
 * The Figma crop (bg 0 -43.063 / 100% 176.304%) is pre-baked into
 * assets/avatars/female-avatar-dp.png so a simple cover fit matches on native.
 */
const ELLIPSE_15_XML = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="32" cy="32" r="31.5" fill="white" stroke="#005F99"/>
</svg>`;

const MALE_AVATAR_DP = require('../../assets/avatars/male-avatar-dp.png');
const FEMALE_AVATAR_DP = require('../../assets/avatars/female-avatar-dp.png');

const SIZE = 64;
const AVATAR_INSET = 1.5;

type Props = {
  avatar: AppAvatar | null;
  onPress: () => void;
  accessibilityLabel: string;
};

/** Home header avatar circle — Male/Female DP framing + Ellipse 15 ring. */
export function HomeAvatarButton({
  avatar,
  onPress,
  accessibilityLabel,
}: Props) {
  const source = avatar === 'female' ? FEMALE_AVATAR_DP : MALE_AVATAR_DP;

  return (
    <PressableScale
      onPress={onPress}
      style={styles.wrap}
      pressedScale={0.94}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <SvgXml xml={ELLIPSE_15_XML} width={SIZE} height={SIZE} />
      <View style={styles.avatarClip}>
        <Image
          source={source}
          style={styles.avatarImage}
          contentFit="cover"
          contentPosition="center"
          cachePolicy="memory-disk"
        />
      </View>
    </PressableScale>
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
