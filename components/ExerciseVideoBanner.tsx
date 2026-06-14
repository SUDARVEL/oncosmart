import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';

type Props = {
  source: string | null;
  fallbackImage: number;
  height?: number;
};

function ExerciseVideoBannerPlayer({
  source,
  height,
}: {
  source: string;
  height: number;
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
    <View style={[styles.banner, { height }]}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="contain"
        nativeControls={false}
      />
    </View>
  );
}

export function ExerciseVideoBanner({ source, fallbackImage, height = 112 }: Props) {
  if (!source) {
    return (
      <View style={[styles.banner, { height }]}>
        <Image source={fallbackImage} style={styles.fallback} contentFit="contain" />
      </View>
    );
  }

  return <ExerciseVideoBannerPlayer source={source} height={height} />;
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.optionBg,
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
