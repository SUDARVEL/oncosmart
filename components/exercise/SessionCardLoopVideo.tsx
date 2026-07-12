/**
 * Muted looping landscape preview for Welcome-to-Day session cards (GIF-like).
 * Keeps the fixed 257×112 frame; contain shows the full body (no cropped legs).
 */
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  SESSION_EXERCISE_CARD_PREVIEW_BACKGROUND,
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
    instance.play();
  });

  useEffect(() => {
    player.loop = true;
    player.muted = true;
    player.play();
  }, [player, uri]);

  return (
    <View style={styles.wrap}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="contain"
        nativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
    height: SESSION_EXERCISE_CARD_PREVIEW_HEIGHT,
    backgroundColor: SESSION_EXERCISE_CARD_PREVIEW_BACKGROUND,
    overflow: 'hidden',
    borderRadius: 8,
  },
  video: {
    width: SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
    height: SESSION_EXERCISE_CARD_PREVIEW_HEIGHT,
  },
});
