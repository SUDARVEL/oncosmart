import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppAvatar } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { GROWTH_ASSETS } from './assets';
import { LevelsProgressRing } from './LevelsProgressRing';

const FEMALE_AVATAR = require('../../assets/avatars/female-avatar.png');

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
        <Pressable
          style={styles.resumeButton}
          onPress={onResume}
          accessibilityRole="button"
          accessibilityLabel={t('growth.resumeProgress')}
        >
          <Image source={GROWTH_ASSETS.playIconGrey} style={styles.playIcon} contentFit="contain" />
          <Text style={styles.resumeText}>{t('growth.resumeProgress')}</Text>
        </Pressable>
      ) : (
        <Pressable
          style={styles.pauseButton}
          onPress={onPause}
          accessibilityRole="button"
          accessibilityLabel={t('growth.pauseProgress')}
        >
          <Image source={GROWTH_ASSETS.pauseIcon} style={styles.pauseIcon} contentFit="contain" />
          <Text style={styles.pauseText}>{t('growth.pauseProgress')}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 348,
    minHeight: 276,
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
    width: 233,
    height: 153,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  gaugeColumn: {
    width: 175,
    height: 153,
  },
  gaugeText: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeTextInner: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 86,
    paddingHorizontal: 4,
  },
  levelCount: {
    fontSize: 22,
    ...font('medium'),
    color: '#262526',
    letterSpacing: 0.3,
    lineHeight: 24,
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
    width: 69,
    height: 172,
    marginTop: -23,
    overflow: 'hidden',
    borderRadius: 4,
  },
  avatarImage: {
    width: 142,
    height: 248,
    marginLeft: -41,
    marginTop: -62,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 35,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    backgroundColor: colors.background,
    minWidth: 137,
    marginTop: 16,
  },
  pauseIcon: {
    width: 16,
    height: 16,
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
    marginTop: 16,
  },
  playIcon: {
    width: 24,
    height: 24,
  },
  resumeText: {
    fontSize: 12,
    ...font('semiBold'),
    color: '#9CA3AF',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
});
