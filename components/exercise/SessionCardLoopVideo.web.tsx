/**
 * Web: muted looping landscape preview for session cards.
 * Keeps the fixed 257×112 preview frame; contain shows the full body.
 */
import { createElement, useState } from 'react';
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
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <View style={styles.wrap} />;
  }

  return (
    <View style={styles.wrap}>
      {createElement('video', {
        key: uri,
        src: uri,
        autoPlay: true,
        loop: true,
        muted: true,
        playsInline: true,
        preload: 'metadata',
        style: styles.video,
        onError: () => setFailed(true),
      })}
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
    objectFit: 'contain',
    display: 'block',
  } as object,
});
