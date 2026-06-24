import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { canMarkVideoComplete } from './sessionVideoCompletion';

type Props = {
  source: string;
  fallbackSources?: string[];
  isPaused: boolean;
  restartToken: number;
  fallbackLoopCount?: number;
  fallbackMinimumSeconds?: number;
  onProgress?: (progress: number) => void;
  onPlaybackBlocked?: () => void;
  onPlaybackError?: () => void;
  onEnded: () => void;
};

export function SessionVideoPlayer({
  source,
  fallbackSources = [],
  isPaused,
  restartToken,
  fallbackLoopCount,
  fallbackMinimumSeconds,
  onProgress,
  onPlaybackBlocked,
  onPlaybackError,
  onEnded,
}: Props) {
  const [activeSource, setActiveSource] = useState(source);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onEndedRef = useRef(onEnded);
  const onProgressRef = useRef(onProgress);
  const onPlaybackBlockedRef = useRef(onPlaybackBlocked);
  const onPlaybackErrorRef = useRef(onPlaybackError);
  const completedRef = useRef(false);
  const durationRef = useRef(0);
  const fallbackElapsedRef = useRef(0);
  const fallbackLoopsCompletedRef = useRef(0);
  const hasStartedRef = useRef(false);
  const isPausedRef = useRef(isPaused);
  const fallbackLoopCountRef = useRef(fallbackLoopCount);
  const fallbackMinimumSecondsRef = useRef(fallbackMinimumSeconds);
  const sourceIndexRef = useRef(0);
  const sourcesRef = useRef<string[]>([source, ...fallbackSources]);

  onEndedRef.current = onEnded;
  onProgressRef.current = onProgress;
  onPlaybackBlockedRef.current = onPlaybackBlocked;
  onPlaybackErrorRef.current = onPlaybackError;
  isPausedRef.current = isPaused;
  fallbackLoopCountRef.current = fallbackLoopCount;
  fallbackMinimumSecondsRef.current = fallbackMinimumSeconds;
  sourcesRef.current = [source, ...fallbackSources];

  const resetProgress = useCallback(() => {
    completedRef.current = false;
    durationRef.current = 0;
    fallbackElapsedRef.current = 0;
    fallbackLoopsCompletedRef.current = 0;
    hasStartedRef.current = false;
    onProgressRef.current?.(0);
  }, []);

  const getFallbackLoopCount = useCallback(() => {
    const count = fallbackLoopCountRef.current ?? 1;
    return Number.isFinite(count) ? Math.max(1, Math.floor(count)) : 1;
  }, []);

  const getFallbackMinimumSeconds = useCallback(() => {
    const seconds = fallbackMinimumSecondsRef.current ?? 0;
    return Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  }, []);

  const updateProgress = useCallback(
    (video: HTMLVideoElement) => {
      const duration = durationRef.current || video.duration || 0;
      if (sourceIndexRef.current > 0) {
        const minimumSeconds = getFallbackMinimumSeconds();
        if (minimumSeconds > 0) {
          onProgressRef.current?.(
            Math.min((fallbackElapsedRef.current + video.currentTime) / minimumSeconds, 1),
          );
          return;
        }

        const loopCount = getFallbackLoopCount();
        if (duration > 0 && loopCount > 1) {
          onProgressRef.current?.(
            Math.min((fallbackLoopsCompletedRef.current + video.currentTime / duration) / loopCount, 1),
          );
          return;
        }
      }

      if (duration > 0) {
        onProgressRef.current?.(Math.min(video.currentTime / duration, 1));
      }
    },
    [getFallbackLoopCount, getFallbackMinimumSeconds],
  );

  const tryComplete = useCallback((video: HTMLVideoElement) => {
    if (completedRef.current || isPausedRef.current) return;

    const duration = durationRef.current || video.duration || 0;
    if (!canMarkVideoComplete(duration, video.currentTime, hasStartedRef.current)) {
      return;
    }

    completedRef.current = true;
    onProgressRef.current?.(1);
    video.pause();
    onEndedRef.current();
  }, []);

  const playVideo = useCallback(async (video?: HTMLVideoElement | null) => {
    const element = video ?? videoRef.current;
    if (!element || isPausedRef.current) return;

    element.muted = false;
    element.volume = 1;

    try {
      await element.play();
    } catch {
      onPlaybackBlockedRef.current?.();
    }
  }, []);

  const switchToNextSource = useCallback(() => {
    const nextIndex = sourceIndexRef.current + 1;
    const nextSource = sourcesRef.current[nextIndex];
    if (!nextSource) return false;

    sourceIndexRef.current = nextIndex;
    resetProgress();
    setActiveSource(nextSource);
    return true;
  }, [resetProgress]);

  useEffect(() => {
    sourceIndexRef.current = 0;
    resetProgress();
    setActiveSource(source);
  }, [resetProgress, source, fallbackSources.join('|'), restartToken]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPaused) {
      video.pause();
      return;
    }

    void playVideo(video);
  }, [isPaused, playVideo]);

  const handleLoadedMetadata = (event: Event) => {
    const video = event.currentTarget as HTMLVideoElement;
    if (video.duration > 0) {
      durationRef.current = video.duration;
      updateProgress(video);
    }
  };

  const handleTimeUpdate = (event: Event) => {
    if (isPausedRef.current || completedRef.current) return;

    const video = event.currentTarget as HTMLVideoElement;
    if (video.currentTime > 0.5) {
      hasStartedRef.current = true;
    }

    if (video.duration > 0) {
      durationRef.current = video.duration;
      updateProgress(video);
    }

  };

  const handleEnded = (event: Event) => {
    const video = event.currentTarget as HTMLVideoElement;
    const duration = durationRef.current || video.duration || 0;

    if (sourceIndexRef.current > 0 && duration > 0) {
      const nextElapsed = fallbackElapsedRef.current + duration;
      const nextLoopsCompleted = fallbackLoopsCompletedRef.current + 1;
      const shouldLoopForSeconds =
        getFallbackMinimumSeconds() > 0 && nextElapsed < getFallbackMinimumSeconds();
      const shouldLoopForReps =
        getFallbackMinimumSeconds() === 0 && nextLoopsCompleted < getFallbackLoopCount();

      if (shouldLoopForSeconds || shouldLoopForReps) {
        fallbackElapsedRef.current = nextElapsed;
        fallbackLoopsCompletedRef.current = nextLoopsCompleted;
        video.currentTime = 0;
        void playVideo(video);
        return;
      }
    }

    tryComplete(video);
  };

  const handleError = () => {
    if (switchToNextSource()) return;
    onPlaybackErrorRef.current?.();
  };

  return (
    <View style={styles.wrap}>
      {createElement('video', {
        key: `${activeSource}-${restartToken}`,
        ref: videoRef,
        src: activeSource,
        playsInline: true,
        preload: 'auto',
        style: styles.video,
        onLoadedMetadata: handleLoadedMetadata,
        onTimeUpdate: handleTimeUpdate,
        onEnded: handleEnded,
        onError: handleError,
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 16,
    backgroundColor: '#000000',
  } as object,
});
