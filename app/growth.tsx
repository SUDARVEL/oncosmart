import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '../components/BottomTabBar';
import { ChatFab } from '../components/ChatFab';
import { CoachMarkOverlay } from '../components/coach/CoachMarkOverlay';
import { BadgesSection } from '../components/growth/BadgesSection';
import { GrowthTabSwitch, type GrowthTab } from '../components/growth/GrowthTabSwitch';
import { LevelsCard } from '../components/growth/LevelsCard';
import { PainProgressCard } from '../components/growth/PainProgressCard';
import { PauseReasonModal, type PauseReason } from '../components/growth/PauseReasonModal';
import { StreakCard } from '../components/growth/StreakCard';
import { WorkoutsSection } from '../components/growth/WorkoutsSection';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAndroidBack } from '../hooks/useAndroidBack';
import { useCoachTour } from '../hooks/useCoachTour';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { getDisplayPainScore } from '../lib/getDisplayPainScore';
import { goBackOr } from '../lib/navBack';
import {
  cancelNextExerciseNotification,
  syncNextExerciseNotification,
} from '../lib/nextExerciseNotification';
import {
  getCurrentWeekdayStreak,
  getCurrentWeekPainScores,
} from '../lib/weekdayStreak';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

const LEVELS_TOTAL = 4;

export default function GrowthScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<GrowthTab>('progress');
  const [showPauseReason, setShowPauseReason] = useState(false);
  const {
    active: coachActive,
    step: coachStep,
    stepIndex: coachStepIndex,
    stepCount: coachStepCount,
    rect: coachRect,
    registerHost,
    registerTarget,
    next: coachNext,
    skip: coachSkip,
  } = useCoachTour('growth');
  const { refreshing, onRefresh } = usePullToRefresh();

  const progressPaused = useAppStore((state) => state.progressPaused);
  const setProgressPaused = useAppStore((state) => state.setProgressPaused);

  // Keep the Growth pills in sync with the active coach step.
  useEffect(() => {
    if (coachStep?.growthTab) {
      setActiveTab(coachStep.growthTab);
    }
  }, [coachStep?.growthTab]);

  const levelsCompleted = useAppStore((state) => state.levelsCompleted);
  const avatar = useAppStore((state) => state.avatar);
  const painScores = useAppStore((state) => state.painScores);
  const dayCompletedAt = useAppStore((state) => state.dayCompletedAt);

  const handlePauseReasonSelect = (reason: PauseReason) => {
    setShowPauseReason(false);
    setProgressPaused(true, reason);
    // Pausing stops exercise reminders until the patient resumes.
    void cancelNextExerciseNotification();
  };

  const handleResumeProgress = () => {
    setProgressPaused(false, null);
    void syncNextExerciseNotification(dayCompletedAt, { paused: false });
  };

  // Streak circles follow the phone calendar (Mon–Sun): complete on Saturday → Sat fills.
  const weekdayStreak = getCurrentWeekdayStreak(dayCompletedAt, {
    locale: i18n.language || 'en',
  });

  // Pain chart follows the same Mon–Sun calendar week as the streak.
  const painScoresByDay = getCurrentWeekPainScores(dayCompletedAt, painScores);

  // Fallback when there's no pain data for this week yet.
  const painScore = getDisplayPainScore(painScores);

  const handleTabPress = (tab: 'home' | 'growth' | 'settings') => {
    if (tab === 'home') router.replace('/home');
    if (tab === 'settings') router.push('/settings');
  };

  const handleBack = useCallback(() => {
    goBackOr(() => router.replace('/home'));
  }, [router]);

  useAndroidBack(
    useCallback(() => {
      handleBack();
      return true;
    }, [handleBack]),
  );

  return (
    <View
      style={styles.screen}
      ref={(node) => registerHost(node)}
      collapsable={false}
    >
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader
        title={t('growth.title')}
        showBack
        onBack={handleBack}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={colors.buttonPrimary}
            colors={[colors.buttonPrimary]}
          />
        }
      >
        <View style={styles.tabSwitcherWrap}>
          <GrowthTabSwitch
            activeTab={activeTab}
            onTabChange={setActiveTab}
            progressAnchorRef={(node) => registerTarget('growth.progress', node)}
            workoutsAnchorRef={(node) => registerTarget('growth.workouts', node)}
          />
        </View>

        {activeTab === 'progress' ? (
          <View style={styles.cards}>
            <LevelsCard
              completed={levelsCompleted}
              total={LEVELS_TOTAL}
              paused={progressPaused}
              avatar={avatar}
              onPause={() => setShowPauseReason(true)}
              onResume={handleResumeProgress}
              pauseAnchorRef={(node) => registerTarget('growth.pauseProgress', node)}
            />
            <StreakCard
              paused={progressPaused}
              completedByWeekday={weekdayStreak.completed}
              weekdayLabels={weekdayStreak.labels}
            />
            <PainProgressCard
              paused={progressPaused}
              scoresByDay={painScoresByDay}
              weekdayLabels={weekdayStreak.labels}
              weekRangeLabel={weekdayStreak.weekRangeLabel}
              fallbackScore={painScore}
            />
            <BadgesSection />
          </View>
        ) : (
          <WorkoutsSection
            firstCardAnchorRef={(node) => registerTarget('growth.workoutCard', node)}
          />
        )}
      </ScrollView>

      <ChatFab bottom={88} />

      <BottomTabBar
        activeTab="growth"
        onTabPress={handleTabPress}
        labels={{
          home: t('home.tabHome'),
          growth: t('home.tabGrowth'),
          settings: t('home.tabSettings'),
        }}
      />

      <PauseReasonModal
        visible={showPauseReason}
        onClose={() => setShowPauseReason(false)}
        onSelect={handlePauseReasonSelect}
      />

    </SafeAreaView>
      {coachActive && coachStep ? (
        <CoachMarkOverlay
          visible
          title={t(coachStep.titleKey)}
          body={t(coachStep.bodyKey)}
          icon={coachStep.icon}
          stepIndex={coachStepIndex}
          stepCount={coachStepCount}
          target={coachRect}
          preferPlacement={coachStep.preferPlacement}
          spotlight={coachStep.spotlight}
          pad={coachStep.pad}
          onNext={() => {
            if (coachStep.id === 'growth.workoutCard') {
              coachNext();
              router.replace('/home');
              return;
            }
            coachNext();
          }}
          onSkip={coachSkip}
        />
      ) : null}
    </View>
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
});
