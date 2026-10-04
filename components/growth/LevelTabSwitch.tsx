import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { WorkoutLevel } from '../../lib/getLevelWorkouts';
import { colors } from '../../theme/colors';
import { uiText } from '../../theme/typography';

type LevelTabSwitchProps = {
  activeLevel: WorkoutLevel;
  onLevelChange: (level: WorkoutLevel) => void;
};

const LEVELS: WorkoutLevel[] = [1, 2, 3, 4];

export function LevelTabSwitch({ activeLevel, onLevelChange }: LevelTabSwitchProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {LEVELS.map((level) => {
        const isActive = activeLevel === level;
        return (
          <Pressable
            key={level}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onLevelChange(level)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[styles.tabText, !isActive && styles.tabTextInactive]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
            >
              {t('growth.workouts.level', { level })}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#F3F4F6',
    borderRadius: 28,
    padding: 6,
    gap: 6,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
  },
  tabText: {
    ...uiText(13, 'medium'),
    textAlign: 'center',
    color: colors.buttonPrimary,
  },
  tabTextInactive: {
    ...uiText(13, 'regular'),
    color: colors.textMuted,
  },
});
