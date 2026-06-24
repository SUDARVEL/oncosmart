import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onEndedRef = useRef(onEnded);
  const onProgressRef = useRef(onProgress);
  const onBufferingRef = useRef(onBuffering);
  const completedRef = useRef(false);
  const durationRef = useRef(0);
  const hasStartedRef = useRef(false);
  const isPausedRef = useRef(isPaused);
  const sourceIndexRef = useRef(0);
  const sourcesRef = useRef<string[]>([source, ...fallbackSources]);

  onEndedRef.current = onEnded;
  onProgressRef.current = onProgress;
  onBufferingRef.current = onBuffering;
  isPausedRef.current = isPaused;
  sourcesRef.current = [source, ...fallbackSources];

  const resetProgress = useCallback(() => {
    completedRef.current = false;
    durationRef.current = 0;
    hasStartedRef.current = false;
    onProgressRef.current?.(0);
    onBufferingRef.current?.(true);
  }, []);

  const playVideo = useCallback(async (video?: HTMLVideoElement | null) => {
    const element = video ?? videoRef.current;
    if (!element || isPausedRef.current) return;

    element.muted = false;
    element.volume = 1;

    try {
      await element.play();
    } catch {
      // Browser autoplay policy — user can tap Resume to start with sound.
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
    }
  };

  const handleWaiting = () => {
    if (completedRef.current) return;
    onBufferingRef.current?.(true);
  };

  const handlePlaying = () => {
    onBufferingRef.current?.(false);
  };

  const handleTimeUpdate = (event: Event) => {
    if (isPausedRef.current || completedRef.current) return;

    const video = event.currentTarget as HTMLVideoElement;
    if (video.currentTime > 0.5) {
      hasStartedRef.current = true;
    }

    if (video.duration > 0) {
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

    completedRef.current = true;
    onProgressRef.current?.(1);
    onBufferingRef.current?.(false);
    video.pause();
    onEndedRef.current();
  };

  const handleError = () => {
    if (switchToNextSource()) return;
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
        onLoadStart: handleWaiting,
        onWaiting: handleWaiting,
        onCanPlay: handlePlaying,
        onPlaying: handlePlaying,
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
