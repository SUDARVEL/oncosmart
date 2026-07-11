import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { WorkoutLevel } from '../../lib/getLevelWorkouts';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

type LevelTabSwitchProps = {
  activeLevel: WorkoutLevel;
  onLevelChange: (level: WorkoutLevel) => void;
};

const LEVELS: WorkoutLevel[] = [1, 2, 3, 4];

export function LevelTabSwitch({ activeLevel, onLevelChange }: LevelTabSwitchProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const switchWidth = Math.min(326, screenWidth - 32);

  return (
    <View style={[styles.container, { width: switchWidth }]}>
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
              style={[styles.tabText, !isActive && styles.tabTextInactive, isActive && styles.tabTextActive]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
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
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 41,
    paddingHorizontal: 4,
    paddingVertical: 4,
    height: 48,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    height: 40,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabActive: {
    backgroundColor: 'rgba(224, 244, 255, 0.2)',
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
  },
  tabText: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    ...font('medium'),
    color: colors.buttonPrimary,
    textTransform: 'capitalize',
  },
  tabTextInactive: {
    ...font('regular'),
    color: colors.textMuted,
    textTransform: 'none',
  },
  tabTextActive: {
    color: colors.buttonPrimary,
    ...font('medium'),
  },
});
