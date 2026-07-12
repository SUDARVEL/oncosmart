import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import type { AppAvatar } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { PressableScale } from '../PressableScale';
import { GROWTH_ASSETS } from './assets';
import { LevelsProgressRing } from './LevelsProgressRing';

const FEMALE_AVATAR = require('../../assets/avatars/female-avatar.png');

/** Figma pause / resume glyphs — SvgXml so they render on native + web. */
const PAUSE_ICON_XML = `<svg viewBox="0 0 8 9.33333" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.33333 9.33333V0H8V9.33333H5.33333ZM0 9.33333V0H2.66667V9.33333H0Z" fill="#005F99"/></svg>`;
const PLAY_ICON_XML = `<svg viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 14V0L11 7L0 14Z" fill="#9CA3AF"/></svg>`;

type LevelsCardProps = {
  completed: number;
  total: number;
  paused: boolean;
  avatar: AppAvatar | null;
  onPause: () => void;
  onResume: () => void;
};

export function LevelsCard({
  completed,
  total,
  paused,
  avatar,
  onPause,
  onResume,
}: LevelsCardProps) {
  const { t } = useTranslation();
  const avatarSource =
    avatar === 'female' ? FEMALE_AVATAR : GROWTH_ASSETS.maleAvatarGrowth;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('growth.levelsTitle')}</Text>

      <View style={styles.heroRow}>
        <View style={styles.gaugeColumn}>
          <LevelsProgressRing completed={completed} total={total} paused={paused} />
          <View style={styles.gaugeText} pointerEvents="none">
            <View style={styles.gaugeTextInner}>
              <Text style={styles.levelCount}>
                {t('growth.levelsCount', { completed, total })}
              </Text>
              <Text style={styles.levelSubtitle}>{t('growth.levelsCompleted')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.avatarFrame}>
          <Image
            source={avatarSource}
            style={styles.avatarImage}
            contentFit="cover"
            contentPosition="top center"
          />
        </View>
      </View>

      {paused ? (
        <PressableScale
          style={styles.resumeButton}
          onPress={onResume}
          accessibilityRole="button"
          accessibilityLabel={t('growth.resumeProgress')}
        >
          <SvgXml xml={PLAY_ICON_XML} width={12} height={16} />
          <Text style={styles.resumeText}>{t('growth.resumeProgress')}</Text>
        </PressableScale>
      ) : (
        <PressableScale
          style={styles.pauseButton}
          onPress={onPause}
          accessibilityRole="button"
          accessibilityLabel={t('growth.pauseProgress')}
        >
          <SvgXml xml={PAUSE_ICON_XML} width={10} height={12} />
          <Text style={styles.pauseText}>{t('growth.pauseProgress')}</Text>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 348,
    minHeight: 288,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    paddingTop: 15,
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    alignSelf: 'stretch',
    fontSize: 16,
    ...font('semiBold'),
    color: colors.textPrimary,
    letterSpacing: -0.26,
    lineHeight: 28,
  },
  heroRow: {
    width: 268,
    height: 168,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  gaugeColumn: {
    width: 192,
    height: 168,
  },
  gaugeText: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeTextInner: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 96,
    paddingHorizontal: 4,
  },
  levelCount: {
    fontSize: 24,
    ...font('medium'),
    color: '#262526',
    letterSpacing: 0.3,
    lineHeight: 26,
    textAlign: 'center',
  },
  levelSubtitle: {
    fontSize: 10,
    ...font('regular'),
    color: '#6B7280',
    lineHeight: 12,
    textAlign: 'center',
    letterSpacing: 0.1,
    marginTop: 1,
  },
  avatarFrame: {
    width: 80,
    height: 198,
    marginTop: -26,
    overflow: 'hidden',
    borderRadius: 4,
  },
  avatarImage: {
    width: 164,
    height: 286,
    marginLeft: -47,
    marginTop: -72,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 35,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    backgroundColor: colors.background,
    minWidth: 137,
    marginTop: 12,
  },
  pauseText: {
    fontSize: 12,
    ...font('semiBold'),
    color: colors.buttonPrimary,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 35,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    backgroundColor: colors.background,
    minWidth: 147,
    marginTop: 12,
  },
  resumeText: {
    fontSize: 12,
    ...font('semiBold'),
    color: '#9CA3AF',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
});
