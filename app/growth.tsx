import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BadgesSection } from '../components/growth/BadgesSection';
import { GrowthTabSwitch, type GrowthTab } from '../components/growth/GrowthTabSwitch';
import { WorkoutsSection } from '../components/growth/WorkoutsSection';
import { LevelsCard } from '../components/growth/LevelsCard';
import { PainProgressCard } from '../components/growth/PainProgressCard';
import { StreakCard } from '../components/growth/StreakCard';
import { BottomTabBar } from '../components/BottomTabBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { getDisplayPainScore } from '../lib/getDisplayPainScore';
import { getCompletedSessionCount } from '../lib/programProgress';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

const LEVELS_TOTAL = 4;

export default function GrowthScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<GrowthTab>('progress');

  const progressPaused = useAppStore((state) => state.progressPaused);
  const setProgressPaused = useAppStore((state) => state.setProgressPaused);
  const levelsCompleted = useAppStore((state) => state.levelsCompleted);
  const avatar = useAppStore((state) => state.avatar);
  const painScores = useAppStore((state) => state.painScores);
  const dayCompletedAt = useAppStore((state) => state.dayCompletedAt);
  const sessionsCompleted = getCompletedSessionCount(dayCompletedAt);

  const painScore = getDisplayPainScore(painScores);

  const handleTabPress = (tab: 'home' | 'growth' | 'settings') => {
    if (tab === 'home') router.replace('/home');
    if (tab === 'settings') router.replace('/settings');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader
        title={t('growth.title')}
        showBack
        onBack={() => router.replace('/home')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabSwitcherWrap}>
          <GrowthTabSwitch activeTab={activeTab} onTabChange={setActiveTab} />
        </View>

        {activeTab === 'progress' ? (
          <View style={styles.cards}>
            <LevelsCard
              completed={levelsCompleted}
              total={LEVELS_TOTAL}
              paused={progressPaused}
              avatar={avatar}
              onPause={() => setProgressPaused(true)}
              onResume={() => setProgressPaused(false)}
            />
            <StreakCard paused={progressPaused} completedDays={sessionsCompleted} />
            <PainProgressCard score={painScore} paused={progressPaused} />
            <BadgesSection />
          </View>
        ) : (
          <WorkoutsSection />
        )}
      </ScrollView>

      <Pressable style={styles.fab} accessibilityRole="button" accessibilityLabel="Chat">
        <Ionicons name="chatbubble" size={24} color={colors.buttonPrimary} />
      </Pressable>

      <BottomTabBar
        activeTab="growth"
        onTabPress={handleTabPress}
        labels={{
          home: t('home.tabHome'),
          growth: t('home.tabGrowth'),
          settings: t('home.tabSettings'),
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    gap: 16,
    alignItems: 'center',
  },
  tabSwitcherWrap: {
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '100%',
  },
  cards: {
    gap: 16,
    alignItems: 'center',
    width: '100%',
  },
  fab: {
    position: 'absolute',
    right: 9,
    bottom: 88,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.tabBarBg,
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});
