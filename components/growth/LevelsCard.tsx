import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { GROWTH_ASSETS } from './assets';

type LevelsCardProps = {
  completed: number;
  total: number;
  paused: boolean;
  onPause: () => void;
  onResume: () => void;
};

export function LevelsCard({ completed, total, paused, onPause, onResume }: LevelsCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('growth.levelsTitle')}</Text>
        {paused ? (
          <Pressable
            style={styles.playButton}
            onPress={onResume}
            accessibilityRole="button"
            accessibilityLabel={t('growth.resumeProgress')}
          >
            <Image source={GROWTH_ASSETS.playIcon} style={styles.playIcon} contentFit="contain" />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.gaugeSection}>
        <View style={styles.gaugeWrap}>
          <Image
            source={paused ? GROWTH_ASSETS.gaugePaused : GROWTH_ASSETS.gaugeActive}
            style={styles.gauge}
            contentFit="contain"
          />
          <View style={styles.gaugeText}>
            <Text style={styles.levelCount}>
              {t('growth.levelsCount', { completed, total })}
            </Text>
            <Text style={styles.levelSubtitle}>{t('growth.levelsCompleted')}</Text>
          </View>
        </View>
      </View>

      {paused ? (
        <Text style={styles.pausedLabel}>{t('growth.progressPaused')}</Text>
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
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 2,
  },
  title: {
    flex: 1,
    fontSize: 16,
    ...font('semiBold'),
    color: colors.textPrimary,
    letterSpacing: -0.26,
    lineHeight: 28,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.optionBg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1.5,
    elevation: 2,
  },
  playIcon: {
    width: 11,
    height: 14,
  },
  gaugeSection: {
    height: 87,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeWrap: {
    width: 150,
    height: 87,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  gauge: {
    position: 'absolute',
    top: -32,
    width: 150,
    height: 164,
  },
  gaugeText: {
    alignItems: 'center',
    gap: 2,
    zIndex: 1,
  },
  levelCount: {
    fontSize: 14,
    ...font('semiBold'),
    color: colors.textPrimary,
    letterSpacing: 0.5,
    lineHeight: 16,
    textAlign: 'center',
  },
  levelSubtitle: {
    fontSize: 12,
    ...font('regular'),
    color: '#99A1AF',
    lineHeight: 14,
    textAlign: 'center',
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
  },
  pauseIcon: {
    width: 8,
    height: 9,
  },
  pauseText: {
    fontSize: 12,
    ...font('semiBold'),
    color: colors.buttonPrimary,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  pausedLabel: {
    fontSize: 12,
    ...font('medium'),
    color: colors.textMuted,
    lineHeight: 14,
    textAlign: 'center',
  },
});
