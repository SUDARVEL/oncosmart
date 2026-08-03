import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { getWeekdayLabels } from '../../lib/weekdayStreak';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

type StreakCardProps = {
  paused?: boolean;
  /**
   * Per weekday (Mon–Sun) completion for the current local week.
   * Index 0 = Monday … 6 = Sunday.
   */
  completedByWeekday?: boolean[];
  /** Optional override labels; defaults to phone-locale short weekdays. */
  weekdayLabels?: string[];
};

const EMPTY_WEEK = [false, false, false, false, false, false, false];

export function StreakCard({
  paused = false,
  completedByWeekday = EMPTY_WEEK,
  weekdayLabels,
}: StreakCardProps) {
  const { t, i18n } = useTranslation();
  const labels = useMemo(
    () => weekdayLabels ?? getWeekdayLabels(i18n.language || 'en'),
    [weekdayLabels, i18n.language],
  );

  return (
    <View style={styles.card}>
      <View style={styles.daysRow}>
        {labels.map((day, index) => {
          const isFilled = completedByWeekday[index] === true;
          const isActive = isFilled && !paused;
          const isGreyedActive = isFilled && paused;

          return (
            <View
              key={`${day}-${index}`}
              style={[
                styles.dayCircle,
                !isActive && !isGreyedActive && styles.dayCircleInactive,
              ]}
            >
              {isActive ? (
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0)', 'rgba(15, 128, 202, 0.45)']}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  style={styles.dayGradient}
                >
                  <Text style={styles.dayLabel}>{day}</Text>
                </LinearGradient>
              ) : isGreyedActive ? (
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0)', 'rgba(102, 102, 102, 1)']}
                  start={{ x: 0.15, y: 0 }}
                  end={{ x: 0.85, y: 1 }}
                  style={styles.dayGradient}
                >
                  <Text style={styles.dayLabel}>{day}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.dayLabel}>{day}</Text>
              )}
            </View>
          );
        })}
      </View>
      <Text style={styles.subtitle}>
        <Text style={styles.subtitleRegular}>{t('growth.streakStart')}</Text>
        <Text style={styles.subtitleBold}>{t('growth.streakHighlight')}</Text>
        <Text style={styles.subtitleRegular}>{t('growth.streakEnd')}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 350,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
    alignItems: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.buttonDisabled,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleInactive: {
    backgroundColor: '#F9FAFB',
  },
  dayGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: 10,
    ...font('medium'),
    color: colors.textMuted,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: -0.08,
    lineHeight: 18,
    color: colors.textMuted,
  },
  subtitleRegular: {
    ...font('regular'),
    color: colors.textMuted,
  },
  subtitleBold: {
    ...font('semiBold'),
    color: colors.textMuted,
  },
});
