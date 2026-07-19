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

/**
 * Figma growth tab switch (3125:5035 / 3124:12260): 322 × 48, radius 41, padding 4.
 * Tabs are content-sized — முன்னேற்றம் pill ≈148, உடற்பயிற்சிகள் pill ≈166 — so the
 * longer Tamil label sits inside its outlined pill without truncating.
 */
const FIGMA_SWITCH_WIDTH = 322;
const PROGRESS_TAB_FLEX = 148;
const WORKOUTS_TAB_FLEX = 166;

export function GrowthTabSwitch({ activeTab, onTabChange }: GrowthTabSwitchProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const switchWidth = Math.min(FIGMA_SWITCH_WIDTH, screenWidth - 32);

  const progressActive = activeTab === 'progress';
  const workoutsActive = activeTab === 'workouts';

  return (
    <View style={[styles.container, { width: switchWidth }]}>
      <PressableScale
        style={[
          styles.tab,
          { flex: PROGRESS_TAB_FLEX },
          progressActive ? styles.tabActive : styles.tabInactive,
        ]}
        pressedScale={0.96}
        onPress={() => onTabChange('progress')}
        accessibilityRole="button"
        accessibilityState={{ selected: progressActive }}
      >
        <Text
          style={[styles.progressText, progressActive ? styles.textActive : styles.textInactive]}
          numberOfLines={1}
        >
          {t('growth.tabProgress')}
        </Text>
      </PressableScale>

      <PressableScale
        style={[
          styles.tab,
          { flex: WORKOUTS_TAB_FLEX },
          workoutsActive ? styles.tabActive : styles.tabInactive,
        ]}
        pressedScale={0.96}
        onPress={() => onTabChange('workouts')}
        accessibilityRole="button"
        accessibilityState={{ selected: workoutsActive }}
      >
        <Text
          style={[styles.workoutsText, workoutsActive ? styles.textActive : styles.textInactive]}
          numberOfLines={1}
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
    borderColor: '#E5E7EB',
    borderRadius: 41,
    padding: 4,
    height: 48,
  },
  tab: {
    minWidth: 0,
    height: 40,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    /** Transparent border keeps width stable when the active outline appears. */
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: 'rgba(224, 244, 255, 0.2)',
    borderColor: colors.buttonPrimary,
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  /** Figma: முன்னேற்றம் uses ButtonText (Roboto Medium 14) in both states. */
  progressText: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    ...font('medium'),
  },
  /** Figma: உடற்பயிற்சிகள் uses Body-2 (Roboto Regular 14) in both states. */
  workoutsText: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    ...font('regular'),
  },
  textActive: {
    color: colors.buttonPrimary,
  },
  textInactive: {
    color: colors.textMuted,
  },
});
