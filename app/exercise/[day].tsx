import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExercisePlayerView } from '../../components/exercise/ExercisePlayerView';
import { RestTimerScreen } from '../../components/exercise/RestTimerScreen';
import {
  WhyDidYouStopModal,
  type StopReason,
} from '../../components/exercise/WhyDidYouStopModal';
import { getSessionExerciseVideoSource } from '../../lib/getDayExercises';
import {
  getSessionExerciseForLevel,
  getSessionExercisesForLevel,
  getSessionRestSecondsForLevel,
  hasGuidedSession,
  isSessionCompleteForLevel,
} from '../../lib/getDay1Session';
import { isExerciseInLevel } from '../../lib/levelExercisePrograms';
import { resolveSessionVideoSources } from '../../lib/getPortraitVideoUrl';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

function LegacyExercisePreview() {
  const router = useRouter();
  const { day, exercise, level: levelParam } = useLocalSearchParams<{
    day: string;
    exercise?: string;
    level?: string;
  }>();
  const dayInLevel = Number(day) || 1;
  const level = Number(levelParam) || 1;
  const exerciseId = typeof exercise === 'string' ? exercise : undefined;

  const language = useAppStore((state) => state.language);
  const gender = useAppStore((state) => state.gender);
  const avatar = useAppStore((state) => state.avatar);

  const source = exerciseId
    ? getSessionExerciseVideoSource(level, exerciseId, language, gender, avatar)
    : null;

  const sessionExercise = exerciseId
    ? getSessionExerciseForLevel(
        level,
        getSessionExercisesForLevel(level).findIndex((entry) => entry.id === exerciseId),
      )
    : null;

  useEffect(() => {
    if (!exerciseId || !isExerciseInLevel(level, exerciseId) || !source || !sessionExercise) {
      router.back();
    }
  }, [exerciseId, level, router, sessionExercise, source]);

  if (!exerciseId || !source || !sessionExercise) {
    return null;
  }

  return (
    <ExercisePlayerView
      exercise={sessionExercise}
      videoSources={[source]}
      onComplete={() => router.back()}
      onBackPress={() => router.back()}
    />
  );
}

function GuidedSessionScreen({
  level,
  dayInLevel,
  sessionKey,
}: {
  level: number;
  dayInLevel: number;
  sessionKey: string;
}) {
  const router = useRouter();
  const { index: indexParam } = useLocalSearchParams<{
    index?: string;
  }>();

  const language = useAppStore((state) => state.language);
  const gender = useAppStore((state) => state.gender);
  const avatar = useAppStore((state) => state.avatar);

  const [exerciseIndex, setExerciseIndex] = useState(() => Math.max(0, Number(indexParam) || 0));
  const [phase, setPhase] = useState<'exercise' | 'rest'>('exercise');
  const [showStopModal, setShowStopModal] = useState(false);
  const exerciseFinishedRef = useRef(false);

  useEffect(() => {
    setExerciseIndex(Math.max(0, Number(indexParam) || 0));
    setPhase('exercise');
    setShowStopModal(false);
    exerciseFinishedRef.current = false;
  }, [indexParam, sessionKey]);

  useEffect(() => {
    exerciseFinishedRef.current = false;
  }, [exerciseIndex]);

  const sessionExercise = getSessionExerciseForLevel(level, exerciseIndex);

  const videoSources = useMemo(() => {
    if (!sessionExercise) return [];

    const landscapeFallback = getSessionExerciseVideoSource(
      level,
      sessionExercise.id,
      language,
      gender,
      avatar,
    );

    return resolveSessionVideoSources(sessionExercise.portraitVideo, landscapeFallback);
  }, [avatar, level, gender, language, sessionExercise]);

  const completeSession = useCallback(() => {
    useAppStore.getState().markSessionCompleted(level, dayInLevel);
    router.replace(`/exercise/complete?level=${level}&day=${dayInLevel}`);
  }, [dayInLevel, level, router]);

  const handleExerciseComplete = useCallback(() => {
    if (exerciseFinishedRef.current) return;
    exerciseFinishedRef.current = true;

    if (isSessionCompleteForLevel(level, exerciseIndex + 1)) {
      completeSession();
      return;
    }

    setPhase('rest');
  }, [completeSession, exerciseIndex, level]);

  const handleRestComplete = useCallback(() => {
    const nextIndex = exerciseIndex + 1;

    if (isSessionCompleteForLevel(level, nextIndex)) {
      completeSession();
      return;
    }

    exerciseFinishedRef.current = false;
    setExerciseIndex(nextIndex);
    setPhase('exercise');
  }, [completeSession, exerciseIndex, level]);

  const exitSession = useCallback(() => {
    setShowStopModal(false);
    router.back();
  }, [router]);

  const handleStopReason = useCallback(
    (_reason: StopReason) => {
      exitSession();
    },
    [exitSession],
  );

  const handleBackPress = useCallback(() => {
    setShowStopModal(true);
  }, []);

  useEffect(() => {
    if (!sessionExercise) {
      completeSession();
    }
  }, [completeSession, sessionExercise]);

  if (!sessionExercise) {
    return null;
  }

  if (phase === 'rest') {
    return (
      <>
        <RestTimerScreen
          key={`rest-${exerciseIndex}`}
          seconds={getSessionRestSecondsForLevel(level)}
          onComplete={handleRestComplete}
          onBackPress={handleBackPress}
        />
        <WhyDidYouStopModal
          visible={showStopModal}
          onClose={() => setShowStopModal(false)}
          onSelect={handleStopReason}
        />
      </>
    );
  }

  if (videoSources.length === 0) {
    return (
      <SafeAreaView style={styles.emptyScreen} edges={['top', 'bottom']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Video not available</Text>
          <Text style={styles.emptyText}>This exercise video has not been uploaded yet.</Text>
          <Pressable style={styles.emptyButton} onPress={() => router.back()}>
            <Text style={styles.emptyButtonText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <ExercisePlayerView
        key={`${sessionExercise.id}-${exerciseIndex}`}
        exercise={sessionExercise}
        videoSources={videoSources}
        onComplete={handleExerciseComplete}
        onBackPress={handleBackPress}
      />
      <WhyDidYouStopModal
        visible={showStopModal}
        onClose={() => setShowStopModal(false)}
        onSelect={handleStopReason}
      />
    </>
  );
}

export default function ExercisePlayerScreen() {
  const router = useRouter();
  const { day, session, exercise, started, level: levelParam } = useLocalSearchParams<{
    day: string;
    session?: string;
    exercise?: string;
    started?: string;
    level?: string;
  }>();
  const dayInLevel = Number(day) || 1;
  const level = Number(levelParam) || 1;

  useEffect(() => {
    if (session === '1' && hasGuidedSession(level)) return;
    if (typeof exercise === 'string') return;
    router.replace(`/exercise/sessions/${dayInLevel}?level=${level}`);
  }, [dayInLevel, exercise, level, router, session]);

  if (session === '1' && hasGuidedSession(level)) {
    return (
      <GuidedSessionScreen
        level={level}
        dayInLevel={dayInLevel}
        sessionKey={started ?? 'default'}
      />
    );
  }

  if (typeof exercise === 'string') {
    return <LegacyExercisePreview />;
  }

  return null;
}

const styles = StyleSheet.create({
  emptyScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    ...font('semiBold'),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    ...font('regular'),
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    ...font('medium'),
  },
});
