/**
 * Muted looping landscape preview for Welcome-to-Day session cards.
 * Reports playback failure so the card can show a still fallback.
 */
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';

import {
  SESSION_EXERCISE_CARD_PREVIEW_HEIGHT,
  SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
} from '../../lib/exerciseVideoFrame';

type Props = {
  uri: string;
  onFailed?: () => void;
  /** Show the top of a 16:9 clip so heads near the top edge are not cropped. */
  alignTop?: boolean;
};

export function SessionCardLoopVideo({ uri, onFailed, alignTop = false }: Props) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.audioMixingMode = 'mixWithOthers';
    instance.play();
  });

  useEffect(() => {
    player.loop = true;
    player.muted = true;
    player.audioMixingMode = 'mixWithOthers';
    player.play();
  }, [player, uri]);

  useEffect(() => {
    const sub = player.addListener('statusChange', (payload) => {
      if (payload.status === 'error') {
        onFailed?.();
      }
    });
    return () => sub.remove();
  }, [onFailed, player]);

  return (
    <VideoView
      style={alignTop ? styles.videoTop : styles.video}
      player={player}
      contentFit="cover"
      nativeControls={false}
      {...(Platform.OS === 'android' ? { surfaceType: 'textureView' as const } : {})}
    />
  );
}

const FULL_FRAME_HEIGHT = Math.round((SESSION_EXERCISE_CARD_PREVIEW_WIDTH * 9) / 16);

const styles = StyleSheet.create({
  videoTop: {
    width: SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
    height: FULL_FRAME_HEIGHT,
  },
  video: {
    width: SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
    height: SESSION_EXERCISE_CARD_PREVIEW_HEIGHT,
    borderRadius: 8,
  },
});
