import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const;

type StreakCardProps = {
  paused?: boolean;
  /** Number of weekday circles filled (0–5). */
  completedDays?: number;
};

export function StreakCard({ paused = false, completedDays = 0 }: StreakCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.daysRow}>
        {WEEKDAYS.map((day, index) => {
          const isFilled = index < completedDays;
          const isActive = isFilled && !paused;
          const isGreyedActive = isFilled && paused;

          return (
            <View
              key={day}
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    alignItems: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
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
    fontSize: 12,
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
