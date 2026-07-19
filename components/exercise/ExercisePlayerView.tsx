import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  LayoutChangeEvent,
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
  EXERCISE_VIDEO_FRAME_ASPECT,
  EXERCISE_VIDEO_FRAME_BACKGROUND,
  EXERCISE_VIDEO_FRAME_BORDER_RADIUS,
  EXERCISE_VIDEO_FRAME_HEIGHT,
  EXERCISE_VIDEO_FRAME_WIDTH,
} from '../../lib/exerciseVideoFrame';
import { colors } from '../../theme/colors';
import { font, displayFontStyle } from '../../theme/fonts';
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

const FOOTER_HEIGHT = 72;

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
  const [seekRequest, setSeekRequest] = useState<{ fraction: number; token: number } | null>(
    null,
  );
  const [audioUnlockToken, setAudioUnlockToken] = useState(0);
  const [progressTrackWidth, setProgressTrackWidth] = useState(0);
  const completedRef = useRef(false);
  const seekTokenRef = useRef(0);

  const unlockAudio = useCallback(() => {
    setAudioUnlockToken((value) => value + 1);
  }, []);

  const playbackPaused = isPaused || overlayPaused;
  const primarySource = videoSources[0]?.trim() ?? '';

  // Exact 349×444 aspect — scale width only on narrow screens; never clamp height.
  const frameWidth = Math.min(EXERCISE_VIDEO_FRAME_WIDTH, Math.max(0, screenWidth - 32));
  const frameHeight =
    frameWidth >= EXERCISE_VIDEO_FRAME_WIDTH
      ? EXERCISE_VIDEO_FRAME_HEIGHT
      : Math.round(frameWidth / EXERCISE_VIDEO_FRAME_ASPECT);

  const title = t(`sessionFlow.exercises.${exercise.id}.title`);
  const description = t(`sessionFlow.exercises.${exercise.id}.description`);

  // Figma rep/duration values are static patient info only.
  // Playback always runs the full video at its own length — never cut to this number.
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
    setSeekRequest(null);
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
    setSeekRequest(null);
    setRestartToken((value) => value + 1);
  };

  const handleProgressTrackLayout = (event: LayoutChangeEvent) => {
    setProgressTrackWidth(event.nativeEvent.layout.width);
  };

  const seekFromLocationX = (locationX: number) => {
    if (progressTrackWidth <= 0 || overlayPaused) return;
    unlockAudio();
    const fraction = Math.min(Math.max(locationX / progressTrackWidth, 0), 1);
    seekTokenRef.current += 1;
    setSeekRequest({ fraction, token: seekTokenRef.current });
    setVideoProgress(fraction);
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: FOOTER_HEIGHT + 8 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Pressable
          style={[
            styles.videoWrap,
            {
              width: frameWidth,
              height: frameHeight,
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
              seekRequest={seekRequest}
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
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          ) : null}
          {playbackFailed ? (
            <View style={styles.videoErrorOverlay} pointerEvents="none">
              <Ionicons name="videocam-off-outline" size={40} color="#FFFFFF" />
              <Text style={styles.videoErrorText}>{t('sessionFlow.videoUnavailable')}</Text>
            </View>
          ) : null}
        </Pressable>

        <Pressable
          style={[styles.videoProgressTrack, { width: frameWidth }]}
          onLayout={handleProgressTrackLayout}
          onPress={(event) => seekFromLocationX(event.nativeEvent.locationX)}
          accessibilityRole="adjustable"
          accessibilityLabel="Video progress"
        >
          <View style={[styles.videoProgressFill, { width: `${videoProgressPercent}%` }]} />
        </Pressable>

        <Text style={[styles.exerciseTitle, { maxWidth: frameWidth }]} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.repRow}>
          <Text style={styles.repValue} numberOfLines={1}>
            {displayValue}
          </Text>
          <Text style={styles.repLabel} numberOfLines={1}>
            {unitLabel}
          </Text>
        </View>

        <Text style={[styles.description, { maxWidth: frameWidth }]}>{description}</Text>
      </ScrollView>

      <View style={styles.footer}>
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

        <PressableScale
          style={styles.restartButton}
          onPress={handleRestart}
          accessibilityRole="button"
        >
          <Ionicons name="refresh" size={22} color="#374151" />
          <Text style={styles.restartButtonText} numberOfLines={1}>
            {t('sessionFlow.restart')}
          </Text>
        </PressableScale>
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
    width: EXERCISE_VIDEO_FRAME_WIDTH,
    height: EXERCISE_VIDEO_FRAME_HEIGHT,
    borderRadius: EXERCISE_VIDEO_FRAME_BORDER_RADIUS,
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
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    minHeight: 60,
  },
  repValue: {
    fontSize: 56,
    lineHeight: 60,
    color: '#00131F',
    ...displayFontStyle(),
  },
  /** Unit (முறை / நிமி / வினாடி / REPS): Tamil-capable font so it never clips. */
  repLabel: {
    fontSize: 30,
    lineHeight: 40,
    color: '#00131F',
    ...font('bold'),
  },
  /** Figma Grey-80 description: 16 / 20 / 0.1, weight 400 */
  description: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: '#6B7280',
    textAlign: 'center',
    ...font('regular'),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 10,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    zIndex: 2,
  },
  /** Figma primary action ~220×48 */
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#005F99',
    paddingLeft: 12,
    paddingRight: 16,
    paddingVertical: 8,
  },
  pauseButtonText: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
    color: '#FFFFFF',
    textTransform: 'capitalize',
    ...font('medium'),
  },
  /** Figma restart ~132×48 — wide enough for மீண்டும் தொடங்கு on one line */
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 132,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingLeft: 10,
    paddingRight: 12,
    paddingVertical: 8,
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
