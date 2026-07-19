import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import type { AppAvatar } from '../../store/useAppStore';
import { PressableScale } from '../PressableScale';
import { colors } from '../../theme/colors';

/**
 * Onboarding Assets / Ellipse 15.svg — ring around home avatar (male).
 * Female DP follows Figma 2910:5246 + Supabase Home page/Female Avatar DP 1.svg:
 *   64×64, border #005F99, background 0px -43.063px / 100% 176.304%
 */
const ELLIPSE_15_XML = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="32" cy="32" r="31.5" fill="white" stroke="#005F99"/>
</svg>`;

const MALE_AVATAR_DP = require('../../assets/avatars/male-avatar-dp.png');
/** Full portrait from Female Avatar DP 1.svg pattern image (Figma bg url). */
const FEMALE_AVATAR_DP = require('../../assets/avatars/female-avatar-dp.png');

const SIZE = 64;
const AVATAR_INSET = 1.5;

/** Figma Dev Mode — Female Avatar DP badge background positioning. */
const FEMALE_DP_BG_TOP = -43.063;
const FEMALE_DP_BG_HEIGHT = '176.304%';

type Props = {
  avatar: AppAvatar | null;
  onPress: () => void;
  accessibilityLabel: string;
};

/** Home header avatar circle — male Ellipse crop / female Figma DP framing. */
export function HomeAvatarButton({
  avatar,
  onPress,
  accessibilityLabel,
}: Props) {
  const isFemale = avatar === 'female';

  return (
    <PressableScale
      onPress={onPress}
      style={styles.wrap}
      pressedScale={0.94}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {isFemale ? (
        <View style={styles.femaleBadge}>
          <Image
            source={FEMALE_AVATAR_DP}
            style={styles.femaleImage}
            contentFit="fill"
            cachePolicy="memory-disk"
            accessibilityIgnoresInvertColors
          />
        </View>
      ) : (
        <>
          <SvgXml xml={ELLIPSE_15_XML} width={SIZE} height={SIZE} />
          <View style={styles.avatarClip}>
            <Image
              source={MALE_AVATAR_DP}
              style={styles.avatarImage}
              contentFit="cover"
              contentPosition="center"
              cachePolicy="memory-disk"
            />
          </View>
        </>
      )}
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
  /** Figma: width/height 64, border-radius ~circle, border 1px #005F99 */
  femaleBadge: {
    width: SIZE,
    height: SIZE,
    aspectRatio: 1,
    borderRadius: 232,
    borderWidth: 1,
    borderColor: '#005F99',
    overflow: 'hidden',
    backgroundColor: '#D3D3D3', // lightgray fallback from Figma
  },
  /**
   * Figma: background ... 0px -43.063px / 100% 176.304% no-repeat
   * Image fills width, scaled taller, shifted up to show head/shoulders.
   */
  femaleImage: {
    position: 'absolute',
    left: 0,
    width: '100%',
    top: FEMALE_DP_BG_TOP,
    height: FEMALE_DP_BG_HEIGHT,
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
