import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExerciseSessionCard } from '../../../components/exercise/ExerciseSessionCard';
import { PulseOximeterModal } from '../../../components/exercise/PulseOximeterModal';
import { getDayExercises, getDaySession } from '../../../lib/getDayExercises';
import { hasGuidedSession } from '../../../lib/getDay1Session';
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

  const session = getDaySession(level);
  const exercises = getDayExercises(level, language, gender, avatar);
  const [showPulseModal, setShowPulseModal] = useState(false);

  const openExercise = (exerciseId: string, hasVideo: boolean) => {
    if (!hasVideo) return;
    router.push(`/exercise/${dayInLevel}?exercise=${exerciseId}&level=${level}`);
  };

  const beginSession = () => {
    if (hasGuidedSession(level)) {
      router.push(
        `/exercise/${dayInLevel}?session=1&level=${level}&index=0&started=${Date.now()}`,
      );
      return;
    }

    const firstPlayable = exercises.find((exercise) => exercise.playbackSource);
    if (firstPlayable) {
      router.push(`/exercise/${dayInLevel}?exercise=${firstPlayable.id}&level=${level}`);
    }
  };

  const handleStartSession = () => {
    if (!exercises.some((exercise) => exercise.playbackSource)) return;
    setShowPulseModal(true);
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {exercises.map((exercise) => (
          <ExerciseSessionCard
            key={exercise.id}
            name={exercise.name}
            repLabel={exercise.repLabel}
            videoSource={exercise.videoSource}
            thumbnail={exercise.thumbnail}
            previewFallbackVideo={exercise.previewFallbackVideo}
            onPress={() => openExercise(exercise.id, Boolean(exercise.playbackSource))}
          />
        ))}
      </ScrollView>

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

      <PulseOximeterModal
        visible={showPulseModal}
        onCancel={() => setShowPulseModal(false)}
        onStart={() => {
          setShowPulseModal(false);
          beginSession();
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
