import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  onPlaybackBlocked: _onPlaybackBlocked,
  onPlaybackError,
  onEnded,
}: Props) {
  const [activeSource, setActiveSource] = useState(source);
  const [isFallbackSource, setIsFallbackSource] = useState(false);
  const sourceIndexRef = useRef(0);
  const sourcesRef = useRef<string[]>([source, ...fallbackSources]);

  sourcesRef.current = [source, ...fallbackSources];

  useEffect(() => {
    sourceIndexRef.current = 0;
    setIsFallbackSource(false);
    setActiveSource(source);
  }, [source, fallbackSources.join('|'), restartToken]);

  const handlePlaybackError = useCallback(() => {
    const nextIndex = sourceIndexRef.current + 1;
    const nextSource = sourcesRef.current[nextIndex];
    if (!nextSource) {
      onPlaybackError?.();
      return;
    }

    sourceIndexRef.current = nextIndex;
    setIsFallbackSource(nextIndex > 0);
    setActiveSource(nextSource);
  }, [onPlaybackError]);

  return (
    <NativeSessionVideoPlayer
      source={activeSource}
      isFallbackSource={isFallbackSource}
      isPaused={isPaused}
      restartToken={restartToken}
      fallbackLoopCount={fallbackLoopCount}
      fallbackMinimumSeconds={fallbackMinimumSeconds}
      onProgress={onProgress}
      onEnded={onEnded}
      onPlaybackError={handlePlaybackError}
    />
  );
}

function NativeSessionVideoPlayer({
  source,
  isFallbackSource,
  isPaused,
  restartToken,
  fallbackLoopCount,
  fallbackMinimumSeconds,
  onProgress,
  onEnded,
  onPlaybackError,
}: {
  source: string;
  isFallbackSource: boolean;
  isPaused: boolean;
  restartToken: number;
  fallbackLoopCount?: number;
  fallbackMinimumSeconds?: number;
  onProgress?: (progress: number) => void;
  onEnded: () => void;
  onPlaybackError: () => void;
}) {
  const onEndedRef = useRef(onEnded);
  const onProgressRef = useRef(onProgress);
  const completedRef = useRef(false);
  const durationRef = useRef(0);
  const fallbackElapsedRef = useRef(0);
  const fallbackLoopsCompletedRef = useRef(0);
  const hasStartedRef = useRef(false);
  const isPausedRef = useRef(isPaused);
  const isFallbackSourceRef = useRef(isFallbackSource);
  const fallbackLoopCountRef = useRef(fallbackLoopCount);
  const fallbackMinimumSecondsRef = useRef(fallbackMinimumSeconds);

  onEndedRef.current = onEnded;
  onProgressRef.current = onProgress;
  isPausedRef.current = isPaused;
  isFallbackSourceRef.current = isFallbackSource;
  fallbackLoopCountRef.current = fallbackLoopCount;
  fallbackMinimumSecondsRef.current = fallbackMinimumSeconds;

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
    (currentTime: number) => {
      const duration = durationRef.current;
      if (isFallbackSourceRef.current) {
        const minimumSeconds = getFallbackMinimumSeconds();
        if (minimumSeconds > 0) {
          onProgressRef.current?.(
            Math.min((fallbackElapsedRef.current + currentTime) / minimumSeconds, 1),
          );
          return;
        }

        const loopCount = getFallbackLoopCount();
        if (duration > 0 && loopCount > 1) {
          onProgressRef.current?.(
            Math.min((fallbackLoopsCompletedRef.current + currentTime / duration) / loopCount, 1),
          );
          return;
        }
      }

      if (duration > 0) {
        onProgressRef.current?.(Math.min(currentTime / duration, 1));
      }
    },
    [getFallbackLoopCount, getFallbackMinimumSeconds],
  );

  const tryComplete = useCallback(
    (currentTime: number) => {
      if (completedRef.current || isPausedRef.current) return;

      const duration = durationRef.current > 0 ? durationRef.current : 0;
      if (!canMarkVideoComplete(duration, currentTime, hasStartedRef.current)) {
        return;
      }

      completedRef.current = true;
      onProgressRef.current?.(1);
      onEndedRef.current();
    },
    [],
  );

  const player = useVideoPlayer(source, (instance) => {
    instance.loop = false;
    instance.muted = false;
    instance.volume = 1;
    instance.audioMixingMode = 'mixWithOthers';
    instance.timeUpdateEventInterval = 0.25;
    instance.play();
  });

  useEffect(() => {
    resetProgress();
  }, [resetProgress, source, restartToken]);

  useEffect(() => {
    player.loop = false;
    player.muted = false;
    player.volume = 1;
    player.audioMixingMode = 'mixWithOthers';
  }, [player]);

  useEffect(() => {
    if (isPaused) {
      player.pause();
      return;
    }

    player.play();
  }, [isPaused, player]);

  useEffect(() => {
    resetProgress();
    player.currentTime = 0;
    player.play();
  }, [player, resetProgress, restartToken]);

  useEffect(() => {
    const statusSubscription = player.addListener('statusChange', (payload) => {
      if (payload.status === 'error') {
        onPlaybackError();
        return;
      }

      if (payload.status === 'readyToPlay' && player.duration > 0) {
        durationRef.current = player.duration;
        updateProgress(player.currentTime);
      }
    });

    const timeSubscription = player.addListener('timeUpdate', (payload) => {
      if (isPausedRef.current || completedRef.current) return;

      const currentTime = payload.currentTime;
      if (currentTime > 0.5) {
        hasStartedRef.current = true;
      }

      if (player.duration > 0) {
        durationRef.current = player.duration;
        updateProgress(currentTime);
      }

    });

    const endSubscription = player.addListener('playToEnd', () => {
      if (player.duration > 0) {
        durationRef.current = player.duration;
      }

      if (isFallbackSourceRef.current && durationRef.current > 0) {
        const nextElapsed = fallbackElapsedRef.current + durationRef.current;
        const nextLoopsCompleted = fallbackLoopsCompletedRef.current + 1;
        const shouldLoopForSeconds =
          getFallbackMinimumSeconds() > 0 && nextElapsed < getFallbackMinimumSeconds();
        const shouldLoopForReps =
          getFallbackMinimumSeconds() === 0 && nextLoopsCompleted < getFallbackLoopCount();

        if (shouldLoopForSeconds || shouldLoopForReps) {
          fallbackElapsedRef.current = nextElapsed;
          fallbackLoopsCompletedRef.current = nextLoopsCompleted;
          player.currentTime = 0;
          player.play();
          return;
        }
      }

      player.pause();
      tryComplete(player.currentTime);
    });

    return () => {
      statusSubscription.remove();
      timeSubscription.remove();
      endSubscription.remove();
    };
  }, [getFallbackLoopCount, getFallbackMinimumSeconds, onPlaybackError, player, tryComplete, updateProgress]);

  return (
    <VideoView
      style={{ width: '100%', height: '100%' }}
      player={player}
      contentFit="cover"
      nativeControls={false}
    />
  );
}
