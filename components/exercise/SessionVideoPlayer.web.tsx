import { createElement, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { ensureExerciseAudioSession } from '../../lib/ensureExerciseAudioSession';
import {
  EXERCISE_VIDEO_FRAME_BACKGROUND,
  EXERCISE_VIDEO_FRAME_BORDER_RADIUS,
  EXERCISE_VIDEO_SOURCE_ASPECT,
  getGuidedVideoPresentation,
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
  exerciseId = '',
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
  const fillFrame = presentation.layout === 'fill-frame';
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
  const needsAudioUnlockRef = useRef(false);

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

  const forceUnmute = useCallback((video: HTMLVideoElement) => {
    video.muted = false;
    video.volume = 1;
    video.defaultMuted = false;
    needsAudioUnlockRef.current = false;
  }, []);

  const playWithSound = useCallback(
    async (video: HTMLVideoElement) => {
      if (isPausedRef.current || completedRef.current) return;

      await ensureExerciseAudioSession();
      video.volume = 1;
      video.defaultMuted = false;
      video.muted = false;

      try {
        await video.play();
        forceUnmute(video);
      } catch {
        needsAudioUnlockRef.current = true;
        video.muted = true;
        try {
          await video.play();
        } catch {
          // Browser still blocking — user must tap Resume.
        }
      }
    },
    [forceUnmute],
  );

  const unlockAndPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || isPausedRef.current || completedRef.current) return;

    await ensureExerciseAudioSession();
    forceUnmute(video);
    try {
      await video.play();
      forceUnmute(video);
    } catch {
      // Ignore — user gesture may still be required.
    }
  }, [forceUnmute]);

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

    void playWithSound(video);
  }, [isPaused, playWithSound]);

  useEffect(() => {
    if (!audioUnlockToken || audioUnlockToken === lastAudioUnlockTokenRef.current) return;
    lastAudioUnlockTokenRef.current = audioUnlockToken;
    void unlockAndPlay();
  }, [audioUnlockToken, unlockAndPlay]);

  useEffect(() => {
    if (!seekRequest) return;
    if (lastSeekTokenRef.current === seekRequest.token) return;
    lastSeekTokenRef.current = seekRequest.token;

    const video = videoRef.current;
    if (!video) return;

    const duration = durationRef.current > 0 ? durationRef.current : video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    completedRef.current = false;
    video.currentTime = Math.min(Math.max(seekRequest.fraction, 0), 1) * duration;
    onProgressRef.current?.(Math.min(video.currentTime / duration, 1));
    void unlockAndPlay();
  }, [seekRequest, unlockAndPlay]);

  const handleLoadedMetadata = (event: Event) => {
    const video = event.currentTarget as HTMLVideoElement;
    if (video.duration > 0 && Number.isFinite(video.duration)) {
      durationRef.current = video.duration;
      onDurationRef.current?.(video.duration);
    }
    if (!isPausedRef.current) {
      void playWithSound(video);
    }
  };

  const handleWaiting = () => {
    if (!completedRef.current) {
      onBufferingRef.current?.(true);
    }
  };

  const handlePlaying = () => {
    onBufferingRef.current?.(false);
    const video = videoRef.current;
    if (video && !needsAudioUnlockRef.current) {
      forceUnmute(video);
    }
  };

  const handleCanPlay = (event: Event) => {
    onBufferingRef.current?.(false);
    const video = event.currentTarget as HTMLVideoElement;
    if (!isPausedRef.current && video.paused) {
      void playWithSound(video);
    }
  };

  const handleTimeUpdate = (event: Event) => {
    if (completedRef.current) return;

    const video = event.currentTarget as HTMLVideoElement;
    if (video.currentTime > 0.5) {
      hasStartedRef.current = true;
    }

    if (video.duration > 0 && Number.isFinite(video.duration)) {
      durationRef.current = video.duration;
    }

    onBufferingRef.current?.(false);
    if (durationRef.current > 0) {
      onProgressRef.current?.(Math.min(video.currentTime / durationRef.current, 1));
    }
  };

  const handleEnded = (event: Event) => {
    const video = event.currentTarget as HTMLVideoElement;
    if (completedRef.current) return;

    const duration = durationRef.current > 0 ? durationRef.current : video.duration;
    if (!shouldAcceptVideoEnd(video.currentTime, duration, hasStartedRef.current)) {
      return;
    }

    completedRef.current = true;
    onProgressRef.current?.(1);
    onBufferingRef.current?.(false);
    video.pause();
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
    <View style={styles.wrap}>
      {/* Default: 349×578 source bottom-aligned in 349×444. Chest stretch fills frame. */}
      <View style={fillFrame ? styles.fillBox : styles.sourceBox}>
        {createElement('video', {
          key: `${source}-${restartToken}`,
          ref: videoRef,
          src: source,
          playsInline: true,
          preload: 'auto',
          controls: false,
          muted: false,
          defaultMuted: false,
          style: {
            ...styles.video,
            objectFit: presentation.contentFit,
            objectPosition: presentation.objectPosition,
          },
          onLoadStart: handleWaiting,
          onWaiting: handleWaiting,
          onCanPlay: handleCanPlay,
          onPlaying: handlePlaying,
          onLoadedMetadata: handleLoadedMetadata,
          onTimeUpdate: handleTimeUpdate,
          onEnded: handleEnded,
          onError: handleError,
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: '100%',
    backgroundColor: EXERCISE_VIDEO_FRAME_BACKGROUND,
    overflow: 'hidden',
    borderRadius: EXERCISE_VIDEO_FRAME_BORDER_RADIUS,
  },
  sourceBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    aspectRatio: EXERCISE_VIDEO_SOURCE_ASPECT,
  },
  fillBox: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: EXERCISE_VIDEO_FRAME_BACKGROUND,
  } as object,
});
