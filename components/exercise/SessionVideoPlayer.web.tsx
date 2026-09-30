import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { ensureExerciseAudioSession } from '../../lib/ensureExerciseAudioSession';
import {
  EXERCISE_VIDEO_FRAME_BACKGROUND,
  EXERCISE_VIDEO_SOURCE_ASPECT,
  getContainedVideoBox,
} from '../../lib/exerciseVideoFrame';
import { shouldAcceptVideoEnd } from './sessionVideoCompletion';

type Props = {
  source: string;
  exerciseId?: string;
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

export function SessionVideoPlayer({
  source,
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
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

  const startPlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video || isPausedRef.current || completedRef.current) return;
    await ensureExerciseAudioSession();
    video.muted = false;
    video.volume = 1;
    try {
      await video.play();
    } catch {
      // Autoplay may be blocked until a user gesture unlocks audio.
    }
  }, []);

  useEffect(() => {
    resetPlaybackState();
  }, [resetPlaybackState, source, restartToken]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPaused) {
      video.pause();
      return;
    }
    void startPlayback();
  }, [isPaused, startPlayback, source, restartToken]);

  useEffect(() => {
    if (!audioUnlockToken || audioUnlockToken === lastAudioUnlockTokenRef.current) return;
    lastAudioUnlockTokenRef.current = audioUnlockToken;
    void startPlayback();
  }, [audioUnlockToken, startPlayback]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    resetPlaybackState();
    video.currentTime = 0;
    if (!isPausedRef.current) {
      void startPlayback();
    } else {
      video.pause();
    }
  }, [resetPlaybackState, restartToken, startPlayback, source]);

  useEffect(() => {
    if (!seekRequest) return;
    if (lastSeekTokenRef.current === seekRequest.token) return;
    lastSeekTokenRef.current = seekRequest.token;

    const video = videoRef.current;
    if (!video) return;
    const duration = durationRef.current > 0 ? durationRef.current : video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    const nextTime = Math.min(Math.max(seekRequest.fraction, 0), 1) * duration;
    completedRef.current = false;
    video.currentTime = nextTime;
    onProgressRef.current?.(Math.min(nextTime / duration, 1));
  }, [seekRequest]);

  const handleFrameLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setFrameSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }, []);

  const letterbox = getContainedVideoBox(
    frameSize.width,
    frameSize.height,
    EXERCISE_VIDEO_SOURCE_ASPECT,
  );

  const handleWaiting = () => onBufferingRef.current?.(true);
  const handleCanPlay = () => onBufferingRef.current?.(false);
  const handlePlaying = () => onBufferingRef.current?.(false);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    if (Number.isFinite(video.duration) && video.duration > 0) {
      durationRef.current = video.duration;
      onDurationRef.current?.(video.duration);
    }
    onBufferingRef.current?.(false);
    if (!isPausedRef.current && !completedRef.current) {
      void startPlayback();
    }
  };

  const handleTimeUpdate = () => {
    if (completedRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime > 0.5) hasStartedRef.current = true;
    if (Number.isFinite(video.duration) && video.duration > 0) {
      durationRef.current = video.duration;
      onDurationRef.current?.(video.duration);
      onProgressRef.current?.(Math.min(video.currentTime / video.duration, 1));
    }
    onBufferingRef.current?.(false);
  };

  const handleEnded = () => {
    if (completedRef.current) return;
    const video = videoRef.current;
    const duration = durationRef.current > 0 ? durationRef.current : (video?.duration ?? 0);
    const currentTime = video?.currentTime ?? 0;
    if (!shouldAcceptVideoEnd(currentTime, duration, hasStartedRef.current)) return;
    completedRef.current = true;
    onProgressRef.current?.(1);
    video?.pause();
    onEndedRef.current();
  };

  const handleError = () => {
    onBufferingRef.current?.(false);
    onPlaybackFailedRef.current?.();
  };

  if (!source?.trim()) {
    return <View style={styles.wrap} />;
  }

  return (
    <View style={styles.wrap} onLayout={handleFrameLayout}>
      {letterbox.width > 0 && letterbox.height > 0
        ? createElement('video', {
            key: `${source}-${restartToken}`,
            ref: videoRef,
            src: source,
            playsInline: true,
            preload: 'auto',
            controls: false,
            muted: false,
            defaultMuted: false,
            style: {
              width: letterbox.width,
              height: letterbox.height,
              objectFit: 'fill',
              backgroundColor: EXERCISE_VIDEO_FRAME_BACKGROUND,
            },
            onLoadStart: handleWaiting,
            onWaiting: handleWaiting,
            onCanPlay: handleCanPlay,
            onPlaying: handlePlaying,
            onLoadedMetadata: handleLoadedMetadata,
            onTimeUpdate: handleTimeUpdate,
            onEnded: handleEnded,
            onError: handleError,
          })
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: '100%',
    backgroundColor: EXERCISE_VIDEO_FRAME_BACKGROUND,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
