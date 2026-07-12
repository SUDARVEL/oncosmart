/**
 * Web: muted looping landscape preview for session cards.
 */
import { createElement, useState } from 'react';
import { StyleSheet, View } from 'react-native';

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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  } as object,
});
