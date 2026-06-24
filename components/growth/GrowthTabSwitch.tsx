import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

export type GrowthTab = 'progress' | 'workouts';

type GrowthTabSwitchProps = {
  activeTab: GrowthTab;
  onTabChange: (tab: GrowthTab) => void;
};

export function GrowthTabSwitch({ activeTab, onTabChange }: GrowthTabSwitchProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tab, activeTab === 'progress' && styles.tabActive]}
        onPress={() => onTabChange('progress')}
        accessibilityRole="button"
        accessibilityState={{ selected: activeTab === 'progress' }}
      >
        <Text style={[styles.tabText, activeTab === 'progress' && styles.tabTextActive]}>
          {t('growth.tabProgress')}
        </Text>
      </Pressable>
      <Pressable
        style={[styles.tab, activeTab === 'workouts' && styles.tabActive]}
        onPress={() => onTabChange('workouts')}
        accessibilityRole="button"
        accessibilityState={{ selected: activeTab === 'workouts' }}
      >
        <Text style={[styles.tabText, styles.tabTextInactive, activeTab === 'workouts' && styles.tabTextActive]}>
          {t('growth.tabWorkouts')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 41,
    paddingHorizontal: 4,
    paddingVertical: 8,
    width: 209,
    height: 48,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  tabActive: {
    backgroundColor: 'rgba(224, 244, 255, 0.2)',
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
  },
  tabText: {
    fontSize: 14,
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
