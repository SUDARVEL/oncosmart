import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  DAYS_PER_LEVEL,
  getActiveLevel,
  sessionKey,
} from '../../lib/programProgress';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

type Props = {
  title?: string;
};

/**
 * Admin-only (and __DEV__) progress cheats for demo / QA.
 * Unpauses before mutations because markSessionCompleted no-ops while paused.
 */
export function AdminTestingTools({ title = 'Admin testing tools' }: Props) {
  const markSessionCompleted = useAppStore((state) => state.markSessionCompleted);
  const setProgressPaused = useAppStore((state) => state.setProgressPaused);
  const setDevUnlockOverride = useAppStore((state) => state.setDevUnlockOverride);
  const devResetProgress = useAppStore((state) => state.devResetProgress);
  const devUnlockOverride = useAppStore((state) => state.devUnlockOverride);
  const progressPaused = useAppStore((state) => state.progressPaused);
  const dayCompletedAt = useAppStore((state) => state.dayCompletedAt);
  const activeLevel = getActiveLevel(dayCompletedAt);

  const nextDayToSkip = (() => {
    for (let day = 1; day <= DAYS_PER_LEVEL; day += 1) {
      if (!dayCompletedAt[sessionKey(activeLevel, day)]) return day;
    }
    return null;
  })();

  const ensureUnpaused = () => {
    if (progressPaused) setProgressPaused(false, null, null);
  };

  const hoursAgo = (hours: number) => Date.now() - hours * 60 * 60 * 1000;

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>
        Active level L{activeLevel}. Pause is cleared automatically before skip/complete.
      </Text>

      <View style={styles.row}>
        <ToolButton
          label="Skip next day"
          disabled={!nextDayToSkip}
          onPress={() => {
            if (!nextDayToSkip) return;
            ensureUnpaused();
            markSessionCompleted(activeLevel, nextDayToSkip, hoursAgo(25));
          }}
        />
        <ToolButton
          label="Skip / complete week"
          onPress={() => {
            ensureUnpaused();
            for (let day = 1; day <= DAYS_PER_LEVEL; day += 1) {
              if (!useAppStore.getState().dayCompletedAt[sessionKey(activeLevel, day)]) {
                markSessionCompleted(
                  activeLevel,
                  day,
                  hoursAgo((DAYS_PER_LEVEL - day + 1) * 25),
                );
              }
            }
          }}
        />
      </View>

      <View style={styles.row}>
        <ToolButton
          label={`Complete all L${activeLevel}`}
          onPress={() => {
            ensureUnpaused();
            for (let day = 1; day <= DAYS_PER_LEVEL; day += 1) {
              markSessionCompleted(
                activeLevel,
                day,
                hoursAgo((DAYS_PER_LEVEL - day + 1) * 25),
              );
            }
          }}
        />
        <ToolButton
          label={devUnlockOverride ? 'Bypass 24h: ON' : 'Bypass 24h: OFF'}
          active={devUnlockOverride}
          onPress={() => setDevUnlockOverride(!devUnlockOverride)}
        />
      </View>

      <View style={styles.row}>
        <ToolButton
          label={progressPaused ? 'Remove pause / quit' : 'Not paused'}
          disabled={!progressPaused}
          onPress={() => setProgressPaused(false, null, null)}
        />
        <ToolButton label="Reset progress" onPress={devResetProgress} danger />
      </View>
    </View>
  );
}

function ToolButton({
  label,
  onPress,
  disabled,
  active,
  danger,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.button,
        active && styles.buttonActive,
        danger && styles.buttonDanger,
        disabled && styles.buttonDisabled,
      ]}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, danger && styles.buttonTextDanger]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
    backgroundColor: '#FFFBEB',
    gap: 10,
  },
  title: {
    ...font('semiBold'),
    fontSize: 13,
    color: '#92400E',
    letterSpacing: 0.3,
  },
  hint: {
    ...font('regular'),
    fontSize: 11,
    color: '#A16207',
    marginTop: -4,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    flexGrow: 1,
    flexBasis: '45%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
  },
  buttonActive: {
    backgroundColor: '#059669',
  },
  buttonDanger: {
    backgroundColor: '#DC2626',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    ...font('semiBold'),
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  buttonTextDanger: {
    color: '#FFFFFF',
  },
});
