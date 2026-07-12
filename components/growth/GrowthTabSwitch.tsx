import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { PressableScale } from '../PressableScale';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

export type GrowthTab = 'progress' | 'workouts';

type GrowthTabSwitchProps = {
  activeTab: GrowthTab;
  onTabChange: (tab: GrowthTab) => void;
};

export function GrowthTabSwitch({ activeTab, onTabChange }: GrowthTabSwitchProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const switchWidth = Math.min(280, Math.max(220, screenWidth - 48));

  return (
    <View style={[styles.container, { width: switchWidth }]}>
      <PressableScale
        style={[styles.tab, activeTab === 'progress' && styles.tabActive]}
        pressedScale={0.96}
        onPress={() => onTabChange('progress')}
        accessibilityRole="button"
        accessibilityState={{ selected: activeTab === 'progress' }}
      >
        <Text
          style={[styles.tabText, activeTab === 'progress' && styles.tabTextActive]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {t('growth.tabProgress')}
        </Text>
      </PressableScale>
      <PressableScale
        style={[styles.tab, activeTab === 'workouts' && styles.tabActive]}
        pressedScale={0.96}
        onPress={() => onTabChange('workouts')}
        accessibilityRole="button"
        accessibilityState={{ selected: activeTab === 'workouts' }}
      >
        <Text
          style={[
            styles.tabText,
            styles.tabTextInactive,
            activeTab === 'workouts' && styles.tabTextActive,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {t('growth.tabWorkouts')}
        </Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    paddingHorizontal: 10,
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
