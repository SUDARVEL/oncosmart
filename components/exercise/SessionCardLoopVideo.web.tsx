/**
 * Web: muted looping landscape preview for session cards.
 * Fixed 257×112 — fill stretches to the frame (no letterbox bars, no crop).
 */
import { createElement, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  SESSION_EXERCISE_CARD_PREVIEW_HEIGHT,
  SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
} from '../../lib/exerciseVideoFrame';

type Props = {
  uri: string;
};

export function SessionCardLoopVideo({ uri }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <View style={styles.video} />;
  }

  return createElement('video', {
    key: uri,
    src: uri,
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    preload: 'metadata',
    style: styles.video,
    onError: () => setFailed(true),
  });
}

const styles = StyleSheet.create({
  video: {
    width: SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
    height: SESSION_EXERCISE_CARD_PREVIEW_HEIGHT,
    borderRadius: 8,
    objectFit: 'fill',
    display: 'block',
  } as object,
});
