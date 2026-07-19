import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

export type TabKey = 'home' | 'growth' | 'settings';

type BottomTabBarProps = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  labels: {
    home: string;
    growth: string;
    settings: string;
  };
};

const TABS: {
  key: TabKey;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'growth', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
  { key: 'settings', icon: 'settings-outline', activeIcon: 'settings' },
];

export function BottomTabBar({ activeTab, onTabPress, labels }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <PressableScale
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            style={styles.tab}
            pressedScale={0.94}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={24}
                color={isActive ? colors.tabActive : colors.tabInactive}
              />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={2}>
              {labels[tab.key]}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 80,
    backgroundColor: colors.tabBarBg,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    overflow: 'hidden',
  },
  /** Figma nav item: column, gap 4, padding 6 0 22, align-self stretch */
  tab: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingTop: 6,
    paddingBottom: 22,
    paddingHorizontal: 4,
  },
  /** Figma icon container 56×32, radius 16 */
  iconWrap: {
    width: 56,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  iconWrapActive: {
    backgroundColor: colors.tabIconActiveBg,
  },
  /** M3/label/medium — 12 / 16 / 0.5, weight 500, Primary #005F99 when active */
  label: {
    alignSelf: 'stretch',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
    color: colors.tabInactive,
    ...font('medium'),
  },
  labelActive: {
    color: colors.tabActive,
  },
});
