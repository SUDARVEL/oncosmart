import { createElement, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PLACEHOLDER_PREVIEW_VIDEO } from '../lib/placeholderVideo';
import {
  EXERCISE_VIDEO_FRAME_ASPECT,
  EXERCISE_VIDEO_FRAME_BACKGROUND,
} from '../lib/exerciseVideoFrame';

type Props = {
  source?: string | null;
  aspectRatio?: number;
  previewContentFit?: 'cover' | 'contain';
  fillContainer?: boolean;
};

export function ExerciseVideoBanner({
  source,
  aspectRatio = EXERCISE_VIDEO_FRAME_ASPECT,
  previewContentFit = 'contain',
  fillContainer = false,
}: Props) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const preferred = source?.trim() || PLACEHOLDER_PREVIEW_VIDEO;
  const playbackSource =
    failedSource === preferred ? PLACEHOLDER_PREVIEW_VIDEO : preferred;

  const bannerStyle = [
    fillContainer ? styles.bannerFill : styles.banner,
    !fillContainer && { aspectRatio },
  ];

  if (failedSource === preferred && failedSource === PLACEHOLDER_PREVIEW_VIDEO) {
    return <View style={bannerStyle} />;
  }

  return (
    <View style={bannerStyle}>
      {createElement('video', {
        key: playbackSource,
        src: playbackSource,
        autoPlay: true,
        loop: true,
        muted: true,
        playsInline: true,
        preload: 'auto',
        style: {
          ...styles.video,
          objectFit: previewContentFit,
          backgroundColor: EXERCISE_VIDEO_FRAME_BACKGROUND,
        },
        onError: () => setFailedSource(playbackSource),
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: EXERCISE_VIDEO_FRAME_BACKGROUND,
  },
  bannerFill: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: EXERCISE_VIDEO_FRAME_BACKGROUND,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectPosition: 'center',
    display: 'block',
  } as object,
});
