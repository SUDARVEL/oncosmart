import { Ionicons } from '@expo/vector-icons';
import type { Ref } from 'react';
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
  /** Optional native anchors for coach-mark measurement. */
  tabAnchorRefs?: Partial<Record<TabKey, Ref<View>>>;
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

export function BottomTabBar({
  activeTab,
  onTabPress,
  labels,
  tabAnchorRefs,
}: BottomTabBarProps) {
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
            <View
              ref={tabAnchorRefs?.[tab.key]}
              collapsable={false}
              style={styles.anchor}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={24}
                  color={isActive ? colors.tabActive : colors.tabInactive}
                />
              </View>
              <Text
                style={[styles.label, isActive && styles.labelActive]}
                numberOfLines={2}
                allowFontScaling
              >
                {labels[tab.key]}
              </Text>
            </View>
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
    minHeight: 88,
    backgroundColor: colors.tabBarBg,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    overflow: 'visible',
  },
  tab: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 2,
  },
  anchor: {
    alignItems: 'center',
    gap: 4,
    alignSelf: 'stretch',
  },
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
  label: {
    alignSelf: 'stretch',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: 'center',
    color: colors.tabInactive,
    ...font('medium'),
    includeFontPadding: true,
  },
  labelActive: {
    color: colors.tabActive,
  },
});
