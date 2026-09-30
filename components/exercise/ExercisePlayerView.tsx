import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Day1SessionExercise } from '../../lib/getDay1Session';
import {
  EXERCISE_SCREEN_DESIGN_WIDTH,
  EXERCISE_SCREEN_GAP,
  EXERCISE_SCREEN_PADDING_BOTTOM,
  EXERCISE_SCREEN_PADDING_TOP,
  EXERCISE_VIDEO_FRAME_BACKGROUND,
  EXERCISE_VIDEO_FRAME_BORDER_RADIUS,
  getExerciseScreenScale,
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
  /** Keep video paused while an overlay (e.g. quit reason modal) is open. */
  overlayPaused?: boolean;
};

export function ExercisePlayerView({
  exercise,
  videoSources,
  onComplete,
  onBackPress,
  overlayPaused = false,
}: Props) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
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

  // Figma screen 390×844 — scale down on narrower phones, never upscale.
  // Video window 349×445; source ~349×623 fits with contain (no crop/stretch).
  const scale = getExerciseScreenScale(screenWidth);
  const { width: frameWidth, height: frameHeight } = getScaledVideoFrameSize(screenWidth);
  const contentWidth = Math.round(EXERCISE_SCREEN_DESIGN_WIDTH * scale);

  const title =
    exercise.title?.trim() ||
    t(`sessionFlow.exercises.${exercise.id}.title`, { defaultValue: 'Exercise' });
  const description =
    exercise.description?.trim() ||
    t(`sessionFlow.exercises.${exercise.id}.description`, {
      defaultValue:
        'Follow the instructor in the video. Move slowly, stay within comfort, and pause if you feel unwell.',
    });

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
      <View style={styles.header}>
        <Pressable onPress={handleBackPress} style={styles.backButton} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            width: contentWidth,
            paddingTop: Math.round(EXERCISE_SCREEN_PADDING_TOP * scale),
            paddingBottom: Math.round(EXERCISE_SCREEN_PADDING_BOTTOM * scale),
            gap: Math.round(EXERCISE_SCREEN_GAP * scale),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
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
          style={[styles.videoProgressTrack, { width: frameWidth }]}
          accessibilityRole="progressbar"
          accessibilityLabel="Video progress"
          accessibilityValue={{ min: 0, max: 100, now: videoProgressPercent }}
        >
          <View style={[styles.videoProgressFill, { width: `${videoProgressPercent}%` }]} />
        </View>

        <ExercisePlayerCopyBlock
          title={title}
          description={description}
          displayValue={displayValue}
          unitLabel={unitLabel}
        />

        <View style={[styles.actions, { width: frameWidth }]}>
          <PressableScale
            style={styles.pauseButton}
            onPress={handlePauseToggle}
            accessibilityRole="button"
          >
            <Ionicons name={playbackPaused ? 'play' : 'pause'} size={22} color="#FFFFFF" />
            <Text style={styles.pauseButtonText} numberOfLines={1}>
              {playbackPaused ? t('sessionFlow.resume') : t('sessionFlow.pause')}
            </Text>
          </PressableScale>

          <PressableScale
            style={styles.restartButton}
            onPress={handleRestart}
            accessibilityRole="button"
          >
            <Ionicons name="refresh" size={20} color="#374151" />
            <Text style={styles.restartButtonText} numberOfLines={1}>
              {t('sessionFlow.restart')}
            </Text>
          </PressableScale>
        </View>
      </ScrollView>
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
  /**
   * Figma exercise column:
   * display:flex; width:390; flex-direction:column; align-items:center;
   * padding:13px 0 65px; gap:11px;
   */
  scrollContent: {
    alignSelf: 'center',
    alignItems: 'center',
    flexGrow: 1,
  },
  videoWrap: {
    // 349×445 @ design, radius 8 — source 349×623 fits with contain
    overflow: 'hidden',
    backgroundColor: EXERCISE_VIDEO_FRAME_BACKGROUND,
    flexShrink: 0,
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
    justifyContent: 'center',
    gap: 9,
    marginTop: 4,
    flexShrink: 0,
  },
  /** Figma primary Pause — pill */
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    height: 48,
    borderRadius: 999,
    backgroundColor: '#005F99',
    paddingHorizontal: 16,
  },
  pauseButtonText: {
    flexShrink: 1,
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
    gap: 4,
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 120,
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
  },
  restartButtonText: {
    flexShrink: 0,
    fontSize: 13,
    lineHeight: 18,
    color: '#374151',
    textTransform: 'capitalize',
    ...font('medium'),
  },
});
