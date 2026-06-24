import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';

import { canMarkVideoComplete, isNearVideoEnd } from './sessionVideoCompletion';

type Props = {
  source: string;
  fallbackSources?: string[];
  isPaused: boolean;
  restartToken: number;
  onProgress?: (progress: number) => void;
  onBuffering?: (isBuffering: boolean) => void;
  onEnded: () => void;
};

export function SessionVideoPlayer({
  source,
  fallbackSources = [],
  isPaused,
  restartToken,
  onProgress,
  onBuffering,
  onEnded,
}: Props) {
  const [activeSource, setActiveSource] = useState(source);
  const sourceIndexRef = useRef(0);
  const sourcesRef = useRef<string[]>([source, ...fallbackSources]);

  sourcesRef.current = [source, ...fallbackSources];

  useEffect(() => {
    sourceIndexRef.current = 0;
    setActiveSource(source);
  }, [source, fallbackSources.join('|'), restartToken]);

  const handlePlaybackError = useCallback(() => {
    const nextIndex = sourceIndexRef.current + 1;
    const nextSource = sourcesRef.current[nextIndex];
    if (!nextSource) return;

    sourceIndexRef.current = nextIndex;
    setActiveSource(nextSource);
  }, []);

  return (
    <NativeSessionVideoPlayer
      source={activeSource}
      isPaused={isPaused}
      restartToken={restartToken}
      onProgress={onProgress}
      onBuffering={onBuffering}
      onEnded={onEnded}
      onPlaybackError={handlePlaybackError}
    />
  );
}

function NativeSessionVideoPlayer({
  source,
  isPaused,
  restartToken,
  onProgress,
  onBuffering,
  onEnded,
  onPlaybackError,
}: {
  source: string;
  isPaused: boolean;
  restartToken: number;
  onProgress?: (progress: number) => void;
  onBuffering?: (isBuffering: boolean) => void;
  onEnded: () => void;
  onPlaybackError: () => void;
}) {
  const onEndedRef = useRef(onEnded);
  const onProgressRef = useRef(onProgress);
  const onBufferingRef = useRef(onBuffering);
  const completedRef = useRef(false);
  const durationRef = useRef(0);
  const hasStartedRef = useRef(false);
  const isPausedRef = useRef(isPaused);

  onEndedRef.current = onEnded;
  onProgressRef.current = onProgress;
  onBufferingRef.current = onBuffering;
  isPausedRef.current = isPaused;

  const resetProgress = useCallback(() => {
    completedRef.current = false;
    durationRef.current = 0;
    hasStartedRef.current = false;
    onProgressRef.current?.(0);
    onBufferingRef.current?.(true);
  }, []);

  const tryComplete = useCallback(
    (currentTime: number) => {
      if (completedRef.current || isPausedRef.current) return;

      const duration = durationRef.current > 0 ? durationRef.current : 0;
      if (!canMarkVideoComplete(duration, currentTime, hasStartedRef.current)) {
        return;
      }

      completedRef.current = true;
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

      if (payload.status === 'loading') {
        onBufferingRef.current?.(true);
      }

      if (payload.status === 'readyToPlay') {
        onBufferingRef.current?.(false);
        if (player.duration > 0) {
          durationRef.current = player.duration;
        }
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
      }

      onBufferingRef.current?.(false);
      const duration = durationRef.current;
      if (duration > 0) {
        onProgressRef.current?.(Math.min(currentTime / duration, 1));
      }
      if (isNearVideoEnd(duration, currentTime)) {
        tryComplete(currentTime);
      }
    });

    const endSubscription = player.addListener('playToEnd', () => {
      if (player.duration > 0) {
        durationRef.current = player.duration;
      }

      onProgressRef.current?.(1);
      player.pause();
      tryComplete(player.currentTime);
    });

    return () => {
      statusSubscription.remove();
      timeSubscription.remove();
      endSubscription.remove();
    };
  }, [onPlaybackError, player, tryComplete]);

  return (
    <VideoView
      style={{ width: '100%', height: '100%' }}
      player={player}
      contentFit="cover"
      nativeControls={false}
    />
  );
}
