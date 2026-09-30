/**
 * Muted looping landscape preview for Welcome-to-Day session cards.
 * Fixed 257×112 — cover places true 16:9 Phase II assets in the stage
 * (fills width, slight studio crop top/bottom — no side letterbox tabs).
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
      contentFit="cover"
      nativeControls={false}
      {...(Platform.OS === 'android' ? { surfaceType: 'textureView' as const } : {})}
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
