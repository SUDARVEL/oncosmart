import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Day1SessionExercise } from '../../lib/getDay1Session';
import { formatExerciseDurationDisplay } from '../../lib/formatExerciseDuration';
import {
  EXERCISE_VIDEO_FRAME_ASPECT,
  EXERCISE_VIDEO_FRAME_BACKGROUND,
  EXERCISE_VIDEO_FRAME_BORDER_RADIUS,
  EXERCISE_VIDEO_FRAME_WIDTH,
} from '../../lib/exerciseVideoFrame';
import { colors } from '../../theme/colors';
import { font, displayFontStyle } from '../../theme/fonts';
import { SessionVideoPlayer } from './SessionVideoPlayer';

type Props = {
  exercise: Day1SessionExercise;
  videoSources: string[];
  onComplete: () => void;
  onBackPress: () => void;
};

const FOOTER_HEIGHT = 72;

export function ExercisePlayerView({ exercise, videoSources, onComplete, onBackPress }: Props) {
  const { t } = useTranslation();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [isPaused, setIsPaused] = useState(false);
  const [restartToken, setRestartToken] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const [videoDurationSeconds, setVideoDurationSeconds] = useState(0);
  const completedRef = useRef(false);

  const frameWidth = Math.min(EXERCISE_VIDEO_FRAME_WIDTH, screenWidth - 32);
  const maxFrameHeight = Math.round(screenHeight * 0.42);
  const frameHeight = Math.min(
    Math.round(frameWidth / EXERCISE_VIDEO_FRAME_ASPECT),
    maxFrameHeight,
  );

  const title = t(`sessionFlow.exercises.${exercise.id}.title`);
  const description = t(`sessionFlow.exercises.${exercise.id}.description`);
  const videoProgressPercent =
    videoProgress > 0 && videoProgress < 0.08 ? 8 : Math.round(videoProgress * 100);

  const durationDisplay = useMemo(() => {
    if (exercise.repType === 'duration' && videoDurationSeconds > 0) {
      return formatExerciseDurationDisplay(videoDurationSeconds);
    }

    return {
      displayValue: exercise.displayValue,
      displayLabel: exercise.displayLabel,
    };
  }, [exercise.displayLabel, exercise.displayValue, exercise.repType, videoDurationSeconds]);

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
    setIsBuffering(true);
    setPlaybackFailed(false);
    setVideoDurationSeconds(0);
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
    setIsBuffering(true);
    setPlaybackFailed(false);
    setVideoDurationSeconds(0);
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: FOOTER_HEIGHT + 8 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View
          style={[
            styles.videoWrap,
            {
              width: frameWidth,
              height: frameHeight,
            },
          ]}
        >
          <SessionVideoPlayer
            key={`${exercise.id}-${restartToken}`}
            source={videoSources[0]}
            fallbackSources={videoSources.slice(1)}
            isPaused={isPaused}
            restartToken={restartToken}
            onProgress={setVideoProgress}
            onBuffering={setIsBuffering}
            onDuration={setVideoDurationSeconds}
            onPlaybackFailed={() => setPlaybackFailed(true)}
            onEnded={handleVideoEnded}
          />
          {isBuffering && !playbackFailed ? (
            <View style={styles.videoLoaderOverlay} pointerEvents="none">
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          ) : null}
          {playbackFailed ? (
            <View style={styles.videoErrorOverlay} pointerEvents="none">
              <Ionicons name="videocam-off-outline" size={40} color="#FFFFFF" />
              <Text style={styles.videoErrorText}>{t('sessionFlow.videoUnavailable')}</Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.videoProgressTrack, { width: frameWidth }]}>
          <View style={[styles.videoProgressFill, { width: `${videoProgressPercent}%` }]} />
        </View>

        <Text style={[styles.exerciseTitle, { maxWidth: frameWidth }]} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.repRow}>
          <Text style={styles.repValue}>{durationDisplay.displayValue}</Text>
          <Text style={styles.repLabel}>
            {durationDisplay.displayLabel === 'MINS'
              ? t('sessionFlow.minsLabel')
              : durationDisplay.displayLabel === 'SECS'
                ? t('sessionFlow.secsLabel')
                : t('sessionFlow.repsLabel')}
          </Text>
        </View>

        <Text style={[styles.description, { maxWidth: frameWidth }]} numberOfLines={4}>
          {description}
        </Text>
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
    marginTop: 8,
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
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  videoWrap: {
    borderRadius: EXERCISE_VIDEO_FRAME_BORDER_RADIUS,
    overflow: 'hidden',
    backgroundColor: EXERCISE_VIDEO_FRAME_BACKGROUND,
  },
  videoLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  videoErrorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 24,
    gap: 12,
  },
  videoErrorText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    ...font('medium'),
  },
  videoProgressTrack: {
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
  exerciseTitle: {
    marginTop: 12,
    fontSize: 22,
    lineHeight: 26,
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
    marginTop: 12,
    minHeight: 52,
  },
  repValue: {
    fontSize: 56,
    lineHeight: 56,
    color: '#00131F',
    ...displayFontStyle(),
  },
  repLabel: {
    fontSize: 32,
    lineHeight: 36,
    color: '#00131F',
    ...displayFontStyle(),
    marginBottom: 4,
  },
  description: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
    ...font('regular'),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 15,
    paddingBottom: 12,
    paddingTop: 10,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    zIndex: 2,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
    maxWidth: 248,
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
