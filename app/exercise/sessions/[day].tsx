import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExerciseSessionCard } from '../../../components/exercise/ExerciseSessionCard';
import type { ResolvedDayExercise } from '../../../lib/getDayExercises';
import { PulseOximeterCoachSheet } from '../../../components/exercise/PulseOximeterCoachSheet';
import { PulseOximeterModal } from '../../../components/exercise/PulseOximeterModal';
import { ResumeProgressModal } from '../../../components/growth/ResumeProgressModal';
import { ReadyToBeginModal } from '../../../components/pain/ReadyToBeginModal';
import { useExercisePauseGuard } from '../../../hooks/useExercisePauseGuard';
import { clearLevelExercisesCache, getDayExercises, getLevelSession } from '../../../lib/getDayExercises';
import { hasGuidedSession, warmPathwaySessionsFromStore } from '../../../lib/getDay1Session';
import { normalizeCancerTypeSlug, resolveMediaGender } from '../../../lib/cancerPathway';
import { getModerateHeartRateUpperLimit } from '../../../lib/moderateHeartRateLimit';
import { syncNextExerciseNotification } from '../../../lib/nextExerciseNotification';
import { useAppStore } from '../../../store/useAppStore';
import { colors } from '../../../theme/colors';
import { font } from '../../../theme/fonts';

export default function ExerciseSessionsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { day, level: levelParam } = useLocalSearchParams<{ day: string; level?: string }>();
  const dayInLevel = Number(day) || 1;
  const level = Number(levelParam) || 1;

  const language = useAppStore((state) => state.language);
  const gender = useAppStore((state) => state.gender);
  const avatar = useAppStore((state) => state.avatar);
  const cancerType = useAppStore((state) => state.cancerType);
  const [pathwayLoaded, setPathwayLoaded] = useState(() => !normalizeCancerTypeSlug(cancerType));
  const age = useAppStore((state) => state.age);
  const ageRange = useAppStore((state) => state.ageRange);
  const dayCompletedAt = useAppStore((state) => state.dayCompletedAt);
  const setProgressPaused = useAppStore((state) => state.setProgressPaused);
  const maxBpm = getModerateHeartRateUpperLimit(age, ageRange);
  const {
    showResumeModal,
    dismissResumeModal,
    runIfProgressActive,
  } = useExercisePauseGuard();

  useEffect(() => {
    const slug = normalizeCancerTypeSlug(cancerType);
    if (!slug) {
      setPathwayLoaded(true);
      return;
    }

    let cancelled = false;
    setPathwayLoaded(false);
    void warmPathwaySessionsFromStore().then(() => {
      if (cancelled) return;
      clearLevelExercisesCache();
      setPathwayLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [avatar, cancerType, gender, language, level]);

  const session = getLevelSession(level);
  const exercises = useMemo(() => {
    if (!pathwayLoaded) return [];
    return getDayExercises(level, language, gender, avatar);
  }, [avatar, gender, language, level, pathwayLoaded]);
  const [showReadyModal, setShowReadyModal] = useState(false);
  const [showOximeterCoach, setShowOximeterCoach] = useState(false);
  const [showPulseModal, setShowPulseModal] = useState(false);
  const oximeterMediaGender = resolveMediaGender(gender, avatar);
  const heartRateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (heartRateTimer.current) clearTimeout(heartRateTimer.current);
    },
    [],
  );

  const continueToHeartRate = () => {
    setShowOximeterCoach(false);
    if (heartRateTimer.current) clearTimeout(heartRateTimer.current);
    // Let the coach sheet finish closing before the heart-rate modal opens.
    heartRateTimer.current = setTimeout(() => setShowPulseModal(true), 280);
  };
  /** Only mount looping preview videos for on-screen cards (avoids blank players). */
  const [activePreviewIds, setActivePreviewIds] = useState<Set<string>>(() => new Set());

  // Seed first paint so cards are not grey while waiting for FlatList viewability.
  useEffect(() => {
    if (exercises.length === 0) {
      setActivePreviewIds(new Set());
      return;
    }
    setActivePreviewIds(new Set(exercises.slice(0, 4).map((exercise) => exercise.id)));
  }, [exercises]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const next = new Set<string>();
      for (const token of viewableItems) {
        const id = (token.item as ResolvedDayExercise | undefined)?.id;
        if (id) next.add(id);
      }
      if (next.size > 0) setActivePreviewIds(next);
    },
    [],
  );

  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: 25, minimumViewTime: 40 }),
    [],
  );

  const beginSession = (startBpm: number) => {
    runIfProgressActive(() => {
      if (hasGuidedSession(level)) {
        router.push(
          `/exercise/${dayInLevel}?session=1&level=${level}&index=0&started=${Date.now()}&startBpm=${startBpm}`,
        );
        return;
      }

      const firstPlayable = exercises.find((exercise) => exercise.playbackSource);
      if (firstPlayable) {
        router.push(
          `/exercise/${dayInLevel}?exercise=${firstPlayable.id}&level=${level}&startBpm=${startBpm}`,
        );
      }
    });
  };

  const handleStartSession = () => {
    if (!exercises.some((exercise) => exercise.playbackSource)) return;
    runIfProgressActive(() => setShowReadyModal(true));
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {t('daySession.welcomeTitle', { day: dayInLevel })}
            <Text style={styles.levelLabel}>
              {t('daySession.levelLabel', { level: session?.level ?? level })}
            </Text>
          </Text>
          <Text style={styles.subtitle}>{t('daySession.subtitle')}</Text>
        </View>
      </View>

      {!pathwayLoaded ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.buttonPrimary} />
          <Text style={styles.loadingText}>{t('daySession.loadingExercises')}</Text>
        </View>
      ) : null}

      <FlatList
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        data={exercises}
        keyExtractor={(exercise) => exercise.id}
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item: exercise }) => (
          <ExerciseSessionCard
            exerciseId={exercise.id}
            name={exercise.name}
            repLabel={exercise.repLabel}
            previewPhoto={exercise.previewPhoto}
            previewVideo={exercise.previewVideo}
            isActive={activePreviewIds.has(exercise.id)}
          />
        )}
      />

      <SafeAreaView style={styles.footer} edges={['bottom']}>
        <Pressable
          style={[
            styles.startButton,
            !exercises.some((exercise) => exercise.playbackSource) && styles.startButtonDisabled,
          ]}
          onPress={handleStartSession}
          disabled={!exercises.some((exercise) => exercise.playbackSource)}
          accessibilityRole="button"
        >
          <Text style={styles.startButtonText}>{t('daySession.startSession')}</Text>
        </Pressable>
      </SafeAreaView>

      <ReadyToBeginModal
        visible={showReadyModal}
        onNo={() => {
          setShowReadyModal(false);
          router.replace('/home');
        }}
        onYes={() => {
          setShowReadyModal(false);
          setShowOximeterCoach(true);
        }}
      />

      <PulseOximeterCoachSheet
        visible={showOximeterCoach}
        mediaGender={oximeterMediaGender}
        onDismiss={() => setShowOximeterCoach(false)}
        onSkip={continueToHeartRate}
        onDone={continueToHeartRate}
      />

      <PulseOximeterModal
        visible={showPulseModal}
        maxBpm={maxBpm}
        onCancel={() => setShowPulseModal(false)}
        onStart={(bpm) => {
          setShowPulseModal(false);
          beginSession(bpm);
        }}
      />

      
      <ResumeProgressModal
        visible={showResumeModal}
        onClose={() => {
          dismissResumeModal();
          router.replace('/home');
        }}
        onResume={() => {
          setProgressPaused(false);
          dismissResumeModal();
          void syncNextExerciseNotification(dayCompletedAt);
          router.replace('/growth');
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 24,
    height: 24,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 11,
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    color: colors.textPrimary,
    ...font('semiBold'),
  },
  levelLabel: {
    fontSize: 16,
    lineHeight: 22,
    ...font('medium'),
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: '#4B5563',
    ...font('regular'),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  loadingWrap: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
    ...font('regular'),
  },
  footer: {
    backgroundColor: '#F9FAFB',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 8,
  },
  startButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    fontSize: 14,
    color: '#F9FAFB',
    textTransform: 'capitalize',
    ...font('medium'),
  },
});
