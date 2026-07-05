import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { PLACEHOLDER_PREVIEW_VIDEO } from '../lib/placeholderVideo';

type Props = {
  source?: string | null;
  /** Width:height ratio for the preview area (landscape exercise videos). */
  aspectRatio?: number;
  previewContentFit?: 'cover' | 'contain';
};

function ExerciseVideoBannerPlayer({
  source,
  aspectRatio,
  previewContentFit,
}: {
  source: string;
  aspectRatio: number;
  previewContentFit: 'cover' | 'contain';
}) {
  const player = useVideoPlayer(source, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });

  useEffect(() => {
    player.loop = true;
    player.muted = true;
    player.play();
  }, [player, source]);

  return (
    <View style={[styles.banner, { aspectRatio }]}>
      <VideoView
        style={StyleSheet.absoluteFillObject}
        player={player}
        contentFit={previewContentFit}
        nativeControls={false}
      />
    </View>
  );
}

export function ExerciseVideoBanner({
  source,
  aspectRatio = 16 / 9,
  previewContentFit = 'cover',
}: Props) {
  const playbackSource = source?.trim() || PLACEHOLDER_PREVIEW_VIDEO;

  return (
    <ExerciseVideoBannerPlayer
      source={playbackSource}
      aspectRatio={aspectRatio}
      previewContentFit={previewContentFit}
    />
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
});
