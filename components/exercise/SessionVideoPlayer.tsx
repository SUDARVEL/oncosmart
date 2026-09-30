import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { ensureExerciseAudioSession } from '../../lib/ensureExerciseAudioSession';
import {
  EXERCISE_VIDEO_FRAME_BACKGROUND,
  EXERCISE_VIDEO_SOURCE_ASPECT,
  getCoverVideoBox,
  getGuidedVideoPresentation,
} from '../../lib/exerciseVideoFrame';
import { shouldAcceptVideoEnd } from './sessionVideoCompletion';

type Props = {
  source: string;
  exerciseId?: string;
  /** Exact Figma media width in px (scaled). Required so layout never waits on onLayout. */
  frameWidth: number;
  /** Exact Figma media height in px (scaled). */
  frameHeight: number;
  isPaused: boolean;
  restartToken: number;
  seekRequest?: { fraction: number; token: number } | null;
  audioUnlockToken?: number;
  onProgress?: (progress: number) => void;
  onBuffering?: (isBuffering: boolean) => void;
  onDuration?: (durationSeconds: number) => void;
  onPlaybackFailed?: () => void;
  onEnded: () => void;
};

function applyAudiblePlayback(player: {
  muted: boolean;
  volume: number;
  audioMixingMode: 'mixWithOthers' | 'duckOthers' | 'auto' | 'doNotMix';
}) {
  player.muted = false;
  player.volume = 1;
  player.audioMixingMode = 'doNotMix';
}

export function SessionVideoPlayer({
  source,
  exerciseId = '',
  frameWidth,
  frameHeight,
  isPaused,
  restartToken,
  seekRequest = null,
  audioUnlockToken = 0,
  onProgress,
  onBuffering,
  onDuration,
  onPlaybackFailed,
  onEnded,
}: Props) {
  const presentation = getGuidedVideoPresentation(exerciseId);
  const onEndedRef = useRef(onEnded);
  const onProgressRef = useRef(onProgress);
  const onBufferingRef = useRef(onBuffering);
  const onDurationRef = useRef(onDuration);
  const onPlaybackFailedRef = useRef(onPlaybackFailed);
  const completedRef = useRef(false);
  const durationRef = useRef(0);
  const hasStartedRef = useRef(false);
  const isPausedRef = useRef(isPaused);
  const lastSeekTokenRef = useRef<number | null>(null);
  const lastAudioUnlockTokenRef = useRef(0);

  onEndedRef.current = onEnded;
  onProgressRef.current = onProgress;
  onBufferingRef.current = onBuffering;
  onDurationRef.current = onDuration;
  onPlaybackFailedRef.current = onPlaybackFailed;
  isPausedRef.current = isPaused;

  const resetPlaybackState = useCallback(() => {
    completedRef.current = false;
    durationRef.current = 0;
    hasStartedRef.current = false;
    onProgressRef.current?.(0);
    onBufferingRef.current?.(true);
  }, []);

  const startPlayback = useCallback(async (player: ReturnType<typeof useVideoPlayer>) => {
    if (isPausedRef.current || completedRef.current) return;
    await ensureExerciseAudioSession();
    applyAudiblePlayback(player);
    player.play();
  }, []);

  const player = useVideoPlayer(source, (instance) => {
    instance.loop = false;
    applyAudiblePlayback(instance);
    instance.timeUpdateEventInterval = 0.25;
  });

  useEffect(() => {
    resetPlaybackState();
  }, [resetPlaybackState, source, restartToken]);

  useEffect(() => {
    player.loop = false;
    applyAudiblePlayback(player);
    player.timeUpdateEventInterval = 0.25;
  }, [player]);

  useEffect(() => {
    if (isPaused) {
      player.pause();
      return;
    }
    void startPlayback(player);
  }, [isPaused, player, startPlayback]);

  useEffect(() => {
    if (!audioUnlockToken || audioUnlockToken === lastAudioUnlockTokenRef.current) return;
    lastAudioUnlockTokenRef.current = audioUnlockToken;
    void startPlayback(player);
  }, [audioUnlockToken, player, startPlayback]);

  useEffect(() => {
    resetPlaybackState();
    try {
      player.currentTime = 0;
    } catch {
      // Player may not be ready yet.
    }
    if (!isPausedRef.current) {
      void startPlayback(player);
    } else {
      player.pause();
    }
  }, [player, resetPlaybackState, restartToken, startPlayback]);

  useEffect(() => {
    if (!seekRequest) return;
    if (lastSeekTokenRef.current === seekRequest.token) return;
    lastSeekTokenRef.current = seekRequest.token;

    const duration = durationRef.current > 0 ? durationRef.current : player.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    const nextTime = Math.min(Math.max(seekRequest.fraction, 0), 1) * duration;
    completedRef.current = false;
    try {
      player.currentTime = nextTime;
    } catch {
      return;
    }
    onProgressRef.current?.(Math.min(nextTime / duration, 1));
  }, [player, seekRequest]);

  useEffect(() => {
    const statusSubscription = player.addListener('statusChange', (payload) => {
      if (payload.status === 'error') {
        onBufferingRef.current?.(false);
        onPlaybackFailedRef.current?.();
        return;
      }

      if (payload.status === 'loading') {
        onBufferingRef.current?.(true);
        return;
      }

      if (payload.status === 'readyToPlay') {
        onBufferingRef.current?.(false);
        if (player.duration > 0) {
          durationRef.current = player.duration;
          onDurationRef.current?.(player.duration);
        }
        if (!isPausedRef.current && !completedRef.current) {
          void startPlayback(player);
        }
      }
    });

    const timeSubscription = player.addListener('timeUpdate', (payload) => {
      if (completedRef.current) return;

      const currentTime = payload.currentTime;
      if (currentTime > 0.5) {
        hasStartedRef.current = true;
      }

      if (player.duration > 0) {
        durationRef.current = player.duration;
        onDurationRef.current?.(player.duration);
      }

      onBufferingRef.current?.(false);
      if (durationRef.current > 0) {
        onProgressRef.current?.(Math.min(currentTime / durationRef.current, 1));
      }
    });

    const endSubscription = player.addListener('playToEnd', () => {
      if (completedRef.current) return;

      const duration = durationRef.current > 0 ? durationRef.current : player.duration;
      const currentTime = player.currentTime;

      if (!shouldAcceptVideoEnd(currentTime, duration, hasStartedRef.current)) {
        return;
      }

      completedRef.current = true;
      onProgressRef.current?.(1);
      player.pause();
      onEndedRef.current();
    });

    return () => {
      statusSubscription.remove();
      timeSubscription.remove();
      endSubscription.remove();
    };
  }, [onPlaybackFailed, player, startPlayback]);

  const width = Math.max(0, Math.round(frameWidth));
  const height = Math.max(0, Math.round(frameHeight));

  /**
   * Figma zoom: size a 9:16 box that covers the 349×444 window (width-fill,
   * taller than the frame). Center it; overflow clips — same as Figma.
   */
  const zoomed = getCoverVideoBox(width, height, EXERCISE_VIDEO_SOURCE_ASPECT);

  if (!source?.trim() || width <= 0 || height <= 0) {
    return <View style={[styles.frame, { width, height }]} />;
  }

  return (
    <View style={[styles.frame, { width, height }]} collapsable={false}>
      {zoomed.width > 0 && zoomed.height > 0 ? (
        <View
          style={[styles.zoomBox, { width: zoomed.width, height: zoomed.height }]}
          collapsable={false}
        >
          <VideoView
            style={{ width: zoomed.width, height: zoomed.height }}
            player={player}
            contentFit="fill"
            nativeControls={false}
            {...(Platform.OS === 'android' ? { surfaceType: 'textureView' as const } : {})}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: EXERCISE_VIDEO_FRAME_BACKGROUND,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBox: {
    overflow: 'hidden',
    backgroundColor: EXERCISE_VIDEO_FRAME_BACKGROUND,
  },
});
