/**
 * Web: muted looping landscape preview for session cards.
 */
import { createElement } from 'react';
import { StyleSheet } from 'react-native';

import {
  SESSION_EXERCISE_CARD_PREVIEW_HEIGHT,
  SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
} from '../../lib/exerciseVideoFrame';

type Props = {
  uri: string;
  onFailed?: () => void;
};

export function SessionCardLoopVideo({ uri, onFailed }: Props) {
  return createElement('video', {
    key: uri,
    src: uri,
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    preload: 'metadata',
    style: styles.video,
    onError: () => onFailed?.(),
  });
}

const styles = StyleSheet.create({
  video: {
    width: SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
    height: SESSION_EXERCISE_CARD_PREVIEW_HEIGHT,
    borderRadius: 8,
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
  } as object,
});
