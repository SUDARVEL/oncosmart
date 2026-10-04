import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getClinicalExerciseDescription,
  getClinicalExerciseTitle,
} from '../../lib/clinicalExerciseDescriptions';
import type { Day1SessionExercise } from '../../lib/getDay1Session';
import {
  EXERCISE_ACTION_BUTTON_GAP,
  EXERCISE_SCREEN_DESIGN_WIDTH,
  EXERCISE_SCREEN_HEADER_HEIGHT,
  EXERCISE_VIDEO_FRAME_BACKGROUND,
  EXERCISE_VIDEO_FRAME_BORDER_RADIUS,
  EXERCISE_VIDEO_TO_COPY_GAP,
  getScaledVideoFrameSize,
} from '../../lib/exerciseVideoFrame';
import { colors } from '../../theme/colors';
import { ExercisePlayerCopyBlock } from './ExercisePlayerCopyBlock';
import { font } from '../../theme/fonts';
import { PressableScale } from '../PressableScale';
import { SessionVideoPlayer } from './SessionVideoPlayer';

type Props = {
  exercise: Day1SessionExercise;
  videoSources: string[];
  onComplete: () => void;
  onBackPress: () => void;
  overlayPaused?: boolean;
};

/**
 * Figma 349×444 (radius 16). Stretch every clip to fill W×H so head/legs/
 * shoes are never cropped.
 */
export function ExercisePlayerView({
  exercise,
  videoSources,
  onComplete,
  onBackPress,
  overlayPaused = false,
}: Props) {
  const { t, i18n } = useTranslation();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [isPaused, setIsPaused] = useState(() => Platform.OS === 'web');
  const [restartToken, setRestartToken] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const [audioUnlockToken, setAudioUnlockToken] = useState(0);
  const completedRef = useRef(false);

  const unlockAudio = useCallback(() => {
    setAudioUnlockToken((value) => value + 1);
  }, []);

  const playbackPaused = isPaused || overlayPaused;
  const primarySource = videoSources[0]?.trim() ?? '';

  const { height: designFrameHeight, scale, contentWidth } = getScaledVideoFrameSize(screenWidth);
  const screenColumnWidth = Math.round(EXERCISE_SCREEN_DESIGN_WIDTH * scale);
  // Leave room under the film for the title, count, instruction, and buttons.
  const frameHeight = Math.max(
    Math.round(210 * scale),
    Math.min(designFrameHeight, Math.round(screenHeight * 0.4)),
  );
  const frameWidth = contentWidth;

  const title =
    getClinicalExerciseTitle(exercise.id) ||
    exercise.title?.trim() ||
    t(`sessionFlow.exercises.${exercise.id}.title`, { defaultValue: '' });
  const description =
    getClinicalExerciseDescription(exercise.id, i18n.language) ||
    exercise.description?.trim() ||
    t(`sessionFlow.exercises.${exercise.id}.description`, { defaultValue: '' });

  const displayValue = exercise.displayValue;
  const displayLabel = exercise.displayLabel;
  const unitLabel =
    displayLabel === 'MINS'
      ? t('sessionFlow.minsLabel')
      : displayLabel === 'SECS'
        ? t('sessionFlow.secsLabel')
        : t('sessionFlow.repsLabel');

  const markComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    completedRef.current = false;
    setIsPaused(Platform.OS === 'web');
    setRestartToken(0);
    setVideoProgress(0);
    setIsBuffering(true);
    setPlaybackFailed(false);
    setAudioUnlockToken((value) => value + 1);
  }, [exercise.id, videoSources.join('|')]);

  const handleVideoEnded = useCallback(() => {
    markComplete();
  }, [markComplete]);

  const videoProgressPercent = Math.round(Math.min(Math.max(videoProgress, 0), 1) * 100);

  const handlePauseToggle = () => {
    if (overlayPaused) return;
    setPlaybackFailed(false);
    unlockAudio();
    setIsPaused((value) => !value);
  };

  const handleBackPress = () => {
    setIsPaused(true);
    onBackPress();
  };

  const handleRestart = () => {
    if (overlayPaused) return;
    unlockAudio();
    completedRef.current = false;
    setIsPaused(false);
    setVideoProgress(0);
    setIsBuffering(true);
    setPlaybackFailed(false);
    setRestartToken((value) => value + 1);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {/* Figma Frame 11 — 390×40 @ y=13 */}
      <View style={[styles.header, { height: Math.round(EXERCISE_SCREEN_HEADER_HEIGHT * scale) }]}>
        <Pressable onPress={handleBackPress} style={styles.backButton} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={[styles.body, { width: screenColumnWidth }]}>
        <View style={[styles.contentColumn, { width: contentWidth }]}>
          <Pressable
            style={[
              styles.videoWrap,
              {
                width: frameWidth,
                height: frameHeight,
                borderRadius: EXERCISE_VIDEO_FRAME_BORDER_RADIUS,
              },
            ]}
            onPress={unlockAudio}
            accessibilityRole="button"
            accessibilityLabel="Unlock video sound"
          >
            {primarySource ? (
              <SessionVideoPlayer
                key={`${exercise.id}-${primarySource}-${restartToken}`}
                source={primarySource}
                exerciseId={exercise.id}
                frameWidth={frameWidth}
                frameHeight={frameHeight}
                isPaused={playbackPaused}
                restartToken={restartToken}
                audioUnlockToken={audioUnlockToken}
                onProgress={setVideoProgress}
                onBuffering={setIsBuffering}
                onDuration={() => {}}
                onPlaybackFailed={() => setPlaybackFailed(true)}
                onEnded={handleVideoEnded}
              />
            ) : null}
            {isBuffering && !playbackFailed ? (
              <View style={styles.videoLoaderOverlay} pointerEvents="none">
                <ActivityIndicator size="large" color="#005F99" />
              </View>
            ) : null}
            {playbackFailed ? (
              <View style={styles.videoErrorOverlay} pointerEvents="none">
                <Ionicons name="videocam-off-outline" size={40} color="#FFFFFF" />
                <Text style={styles.videoErrorText}>{t('sessionFlow.videoUnavailable')}</Text>
              </View>
            ) : null}
          </Pressable>

          <View
            style={[
              styles.videoProgressTrack,
              { width: frameWidth, marginTop: Math.round(8 * scale) },
            ]}
            accessibilityRole="progressbar"
            accessibilityLabel="Video progress"
            accessibilityValue={{ min: 0, max: 100, now: videoProgressPercent }}
          >
            <View style={[styles.videoProgressFill, { width: `${videoProgressPercent}%` }]} />
          </View>

          <View style={{ height: Math.round(EXERCISE_VIDEO_TO_COPY_GAP * scale) - 8 }} />

          <ExercisePlayerCopyBlock
            compact
            title={title}
            description={description}
            displayValue={displayValue}
            unitLabel={unitLabel}
          />
        </View>
      </View>

      <View style={[styles.footer, { width: screenColumnWidth }]}>
          <View style={[styles.actions, { width: contentWidth }]}>
            <PressableScale
              style={styles.pauseButton}
              onPress={handlePauseToggle}
              accessibilityRole="button"
            >
              <Ionicons name={playbackPaused ? 'play' : 'pause'} size={24} color="#FFFFFF" />
              <Text style={styles.pauseButtonText} numberOfLines={1}>
                {playbackPaused ? t('sessionFlow.resume') : t('sessionFlow.pause')}
              </Text>
            </PressableScale>

            <View
              style={{ width: Math.round(EXERCISE_ACTION_BUTTON_GAP * scale) }}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />

            <PressableScale
              style={[
                styles.restartButton,
                {
                  minWidth: Math.round(112 * scale),
                  paddingHorizontal: Math.round(12 * scale),
                },
              ]}
              onPress={handleRestart}
              accessibilityRole="button"
            >
              <Ionicons name="refresh" size={22} color="#374151" />
              <Text style={styles.restartButtonText} numberOfLines={1}>
                {t('sessionFlow.restart')}
              </Text>
            </PressableScale>
          </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    // Figma artboard is border-box 390×844
  },
  header: {
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    minHeight: 0,
  },
  contentColumn: {
    flex: 1,
    alignItems: 'center',
    minHeight: 0,
  },
  footer: {
    alignSelf: 'center',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  videoWrap: {
    overflow: 'hidden',
    backgroundColor: EXERCISE_VIDEO_FRAME_BACKGROUND,
    flexShrink: 1,
    minHeight: 0,
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
    height: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#9CC7E0',
    backgroundColor: '#E5EEF5',
    overflow: 'hidden',
    flexShrink: 0,
  },
  videoProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#0074B8',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexShrink: 0,
  },
  pauseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#005F99',
    paddingLeft: 12,
    paddingRight: 16,
  },
  pauseButtonText: {
    fontSize: 14,
    lineHeight: 18,
    color: '#FFFFFF',
    textTransform: 'capitalize',
    ...font('medium'),
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  restartButtonText: {
    fontSize: 14,
    lineHeight: 18,
    color: '#374151',
    textTransform: 'capitalize',
    ...font('medium'),
  },
});
