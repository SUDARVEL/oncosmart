import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DAYS_PER_LEVEL,
  getNextSession,
  TOTAL_LEVELS,
  UNLOCK_DELAY_MS,
} from '../../lib/programProgress';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

function formatUnlockTime(epochMs: number): string {
  try {
    return new Date(epochMs).toLocaleString(undefined, {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function SessionCompleteScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { level: levelParam, day: dayParam } = useLocalSearchParams<{
    level?: string;
    day?: string;
  }>();
  const level = Number(levelParam) || 1;
  const dayInLevel = Number(dayParam) || 1;

  const completedAt = useAppStore(
    (state) => state.dayCompletedAt[`L${level}D${dayInLevel}`],
  );

  const next = getNextSession(level, dayInLevel);
  const unlockAt = completedAt ? completedAt + UNLOCK_DELAY_MS : Date.now() + UNLOCK_DELAY_MS;
  const finishedLevel = dayInLevel >= DAYS_PER_LEVEL;
  const hasNext = next != null;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Ionicons name="checkmark" size={56} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>
          {finishedLevel
            ? t('complete.levelTitle', { level })
            : t('complete.dayTitle', { level, day: dayInLevel })}
        </Text>
        <Text style={styles.subtitle}>{t('complete.subtitle')}</Text>

        {hasNext ? (
          <View style={styles.infoCard}>
            <Ionicons name="lock-closed" size={18} color={colors.buttonPrimary} />
            <Text style={styles.infoText}>
              {finishedLevel
                ? t('complete.nextLevelUnlock', {
                    level: next.level,
                    when: formatUnlockTime(unlockAt),
                  })
                : t('complete.nextDayUnlock', {
                    day: next.dayInLevel,
                    when: formatUnlockTime(unlockAt),
                  })}
            </Text>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <Ionicons name="trophy" size={18} color={colors.buttonPrimary} />
            <Text style={styles.infoText}>{t('complete.allDone')}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.primaryButton}
          accessibilityRole="button"
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.primaryButtonText}>{t('complete.goHome')}</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          accessibilityRole="button"
          onPress={() => router.replace('/growth')}
        >
          <Text style={styles.secondaryButtonText}>{t('complete.viewProgress')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    ...font('semiBold'),
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    ...font('regular'),
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.homeCardBg,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    ...font('medium'),
    color: colors.textPrimary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  primaryButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    ...font('medium'),
    color: '#F9FAFB',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    ...font('medium'),
    color: colors.buttonPrimary,
  },
});
