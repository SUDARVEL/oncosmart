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
 * Figma growth tab switch (3125:5035 / 3124:12265). Each pill has a fixed Figma
 * width — முன்னேற்றம் 148, உடற்பயிற்சிகள் 166 — so the longer Tamil label always
 * fits without truncating. Widths scale down together only on very narrow screens.
 */
const FIGMA_PROGRESS_WIDTH = 148;
const FIGMA_WORKOUTS_WIDTH = 166;
const CONTAINER_PADDING = 4;
const CONTAINER_BORDER = 1;
const FIGMA_CONTAINER_WIDTH =
  FIGMA_PROGRESS_WIDTH +
  FIGMA_WORKOUTS_WIDTH +
  CONTAINER_PADDING * 2 +
  CONTAINER_BORDER * 2;

export function GrowthTabSwitch({ activeTab, onTabChange }: GrowthTabSwitchProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const scale = Math.min(1, (screenWidth - 32) / FIGMA_CONTAINER_WIDTH);
  const progressWidth = Math.round(FIGMA_PROGRESS_WIDTH * scale);
  const workoutsWidth = Math.round(FIGMA_WORKOUTS_WIDTH * scale);

  const progressActive = activeTab === 'progress';
  const workoutsActive = activeTab === 'workouts';

  return (
    <View style={styles.container}>
      <PressableScale
        style={[
          styles.tab,
          { width: progressWidth },
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
          { width: workoutsWidth },
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
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: CONTAINER_BORDER,
    borderColor: '#E5E7EB',
    borderRadius: 41,
    padding: CONTAINER_PADDING,
    height: 48,
  },
  /** Figma pill: h40, radius 35, padding 12×24, justify/align center */
  tab: {
    height: 40,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
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
  /** முன்னேற்றம் — Roboto Medium 14 */
  progressText: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    ...font('medium'),
  },
  /** உடற்பயிற்சிகள் — Roboto Regular 14 */
  workoutsText: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    ...font('regular'),
  },
  /** Selected → Primary blue */
  textActive: {
    color: colors.buttonPrimary,
  },
  /** Unselected → black */
  textInactive: {
    color: colors.textPrimary,
  },
});
