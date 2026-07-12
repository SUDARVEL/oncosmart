/**
 * Muted looping landscape preview for Welcome-to-Day session cards (GIF-like).
 * Fixed 257×112 — fill stretches to the frame (no letterbox bars, no crop).
 */
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import {
  SESSION_EXERCISE_CARD_PREVIEW_HEIGHT,
  SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
} from '../../lib/exerciseVideoFrame';

type Props = {
  uri: string;
};

export function SessionCardLoopVideo({ uri }: Props) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = true;
    instance.muted = true;
    // Never steal audio focus from the guided session player.
    instance.audioMixingMode = 'mixWithOthers';
    instance.play();
  });

  useEffect(() => {
    player.loop = true;
    player.muted = true;
    player.audioMixingMode = 'mixWithOthers';
    player.play();
  }, [player, uri]);

  return (
    <VideoView
      style={styles.video}
      player={player}
      contentFit="fill"
      nativeControls={false}
    />
  );
}

const styles = StyleSheet.create({
  video: {
    width: SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
    height: SESSION_EXERCISE_CARD_PREVIEW_HEIGHT,
    borderRadius: 8,
  },
});
