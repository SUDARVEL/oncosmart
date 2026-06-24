import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  source: string | null;
  fallbackImage?: number;
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
        style={styles.video}
        player={player}
        contentFit={previewContentFit}
        nativeControls={false}
      />
    </View>
  );
}

export function ExerciseVideoBanner({
  source,
  fallbackImage,
  aspectRatio = 16 / 9,
  previewContentFit = 'cover',
}: Props) {
  if (!source) {
    if (!fallbackImage) {
      return <View style={[styles.banner, { aspectRatio, backgroundColor: '#E5E7EB' }]} />;
    }
    return (
      <View style={[styles.banner, { aspectRatio }]}>
        <Image source={fallbackImage} style={styles.fallback} contentFit="cover" />
      </View>
    );
  }

  return (
    <ExerciseVideoBannerPlayer
      source={source}
      aspectRatio={aspectRatio}
      previewContentFit={previewContentFit}
    />
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    width: '100%',
    height: '100%',
  },
});
