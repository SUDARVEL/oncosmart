import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Day1SessionExercise } from '../../lib/getDay1Session';
import { colors } from '../../theme/colors';
import { font, displayFontStyle } from '../../theme/fonts';
import { SessionVideoPlayer } from './SessionVideoPlayer';

type Props = {
  exercise: Day1SessionExercise;
  videoSources: string[];
  onComplete: () => void;
  onBackPress: () => void;
};

export function ExercisePlayerView({ exercise, videoSources, onComplete, onBackPress }: Props) {
  const { t } = useTranslation();
  const [isPaused, setIsPaused] = useState(false);
  const [restartToken, setRestartToken] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const completedRef = useRef(false);

  const title = t(`sessionFlow.exercises.${exercise.id}.title`);
  const description = t(`sessionFlow.exercises.${exercise.id}.description`);
  const fallbackLoopCount = exercise.repType === 'reps' ? exercise.repValue : undefined;
  const fallbackMinimumSeconds = exercise.repType === 'duration' ? exercise.repValue : undefined;
  const videoProgressPercent =
    videoProgress > 0 && videoProgress < 0.08 ? 8 : Math.round(videoProgress * 100);

  const markComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    completedRef.current = false;
    setIsPaused(false);
    setRestartToken(0);
    setVideoProgress(0);
    setVideoError(false);
  }, [exercise.id, videoSources.join('|')]);

  const handleVideoEnded = useCallback(() => {
    markComplete();
  }, [markComplete]);

  const handlePauseToggle = () => {
    setIsPaused((value) => !value);
  };

  const handleRestart = () => {
    completedRef.current = false;
    setIsPaused(false);
    setVideoProgress(0);
    setVideoError(false);
    setRestartToken((value) => value + 1);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={onBackPress} style={styles.backButton} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.videoWrap}>
          {videoError ? (
            <View style={styles.videoErrorState}>
              <Text style={styles.videoErrorTitle}>Video not available</Text>
              <Text style={styles.videoErrorText}>The full session video could not be played.</Text>
            </View>
          ) : (
            <SessionVideoPlayer
              key={`${exercise.id}-${restartToken}`}
              source={videoSources[0]}
              fallbackSources={videoSources.slice(1)}
              isPaused={isPaused}
              restartToken={restartToken}
              fallbackLoopCount={fallbackLoopCount}
              fallbackMinimumSeconds={fallbackMinimumSeconds}
              onProgress={setVideoProgress}
              onPlaybackBlocked={() => setIsPaused(true)}
              onPlaybackError={() => setVideoError(true)}
              onEnded={handleVideoEnded}
            />
          )}
        </View>
        <View style={styles.videoProgressTrack}>
          <View style={[styles.videoProgressFill, { width: `${videoProgressPercent}%` }]} />
        </View>

        <Text style={styles.exerciseTitle}>{title}</Text>

        <View style={styles.repRow}>
          <Text style={styles.repValue}>{exercise.displayValue}</Text>
          <Text style={styles.repLabel}>
            {exercise.displayLabel === 'MINS'
              ? t('sessionFlow.minsLabel')
              : t('sessionFlow.repsLabel')}
          </Text>
        </View>

        <Text style={styles.description}>{description}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.pauseButton}
          onPress={handlePauseToggle}
          accessibilityRole="button"
        >
          <Ionicons name={isPaused ? 'play' : 'pause'} size={24} color="#FFFFFF" />
          <Text style={styles.pauseButtonText}>
            {isPaused ? t('sessionFlow.resume') : t('sessionFlow.pause')}
          </Text>
        </Pressable>

        <Pressable
          style={styles.restartButton}
          onPress={handleRestart}
          accessibilityRole="button"
        >
          <Ionicons name="refresh" size={24} color="#374151" />
          <Text style={styles.restartButtonText}>{t('sessionFlow.restart')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginTop: 13,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20.5,
    paddingBottom: 16,
    alignItems: 'center',
  },
  videoWrap: {
    width: 349,
    height: 444,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  videoProgressTrack: {
    width: 349,
    height: 8,
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#9CC7E0',
    backgroundColor: '#E5EEF5',
    overflow: 'hidden',
  },
  videoProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#0074B8',
  },
  videoErrorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F3F4F6',
  },
  videoErrorTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    ...font('semiBold'),
  },
  videoErrorText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    ...font('regular'),
  },
  exerciseTitle: {
    marginTop: 13,
    fontSize: 24,
    lineHeight: 28,
    color: '#262526',
    textAlign: 'center',
    textTransform: 'uppercase',
    ...font('semiBold'),
  },
  repRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    minHeight: 64,
  },
  repValue: {
    fontSize: 64,
    lineHeight: 64,
    color: '#00131F',
    ...displayFontStyle(),
  },
  repLabel: {
    fontSize: 36,
    lineHeight: 40,
    color: '#00131F',
    ...displayFontStyle(),
    marginBottom: 6,
  },
  description: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 349,
    ...font('regular'),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 15,
    paddingBottom: 16,
    paddingTop: 8,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: 248,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#005F99',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pauseButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    textTransform: 'capitalize',
    ...font('medium'),
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: 101,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 10,
  },
  restartButtonText: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
    ...font('medium'),
  },
});
