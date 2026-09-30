import { createElement, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

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
  frameWidth: number;
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
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

  const width = Math.max(0, Math.round(frameWidth));
  const height = Math.max(0, Math.round(frameHeight));
  const stretch = presentation.contentFit === 'fill';
  const videoBox = stretch
    ? { width, height }
    : getCoverVideoBox(width, height, EXERCISE_VIDEO_SOURCE_ASPECT);

  if (!source?.trim() || width <= 0 || height <= 0) {
    return <View style={[styles.wrap, { width, height }]} />;
  }

  return (
    <View style={[styles.wrap, { width, height }]}>
      {videoBox.width > 0 && videoBox.height > 0
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
              width: videoBox.width,
              height: videoBox.height,
              objectFit: 'fill',
              objectPosition: presentation.objectPosition,
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
    backgroundColor: EXERCISE_VIDEO_FRAME_BACKGROUND,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
