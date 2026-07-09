import { Ionicons } from '@expo/vector-icons';
import type { ImageSource } from 'expo-image';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ExerciseVideoBanner } from '../ExerciseVideoBanner';
import { EXERCISE_VIDEO_FRAME_ASPECT, EXERCISE_VIDEO_FRAME_BACKGROUND } from '../../lib/exerciseVideoFrame';
import { PLACEHOLDER_PREVIEW_VIDEO } from '../../lib/placeholderVideo';
import { font } from '../../theme/fonts';

const PREVIEW_ASPECT = EXERCISE_VIDEO_FRAME_ASPECT;

type Props = {
  name: string;
  repLabel: string;
  videoSource: string | null;
  thumbnail: ImageSource | null;
  previewFallbackVideo: string | null;
  onPress: () => void;
};

export function ExerciseSessionCard({
  name,
  repLabel,
  videoSource,
  thumbnail,
  previewFallbackVideo,
  onPress,
}: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button">
      <View style={styles.body}>
        <View style={styles.previewWrap}>
          {videoSource ? (
            <ExerciseVideoBanner
              source={videoSource}
              aspectRatio={PREVIEW_ASPECT}
              previewContentFit="contain"
            />
          ) : thumbnail ? (
            <>
              <Image
                source={thumbnail}
                style={[styles.thumbnail, { aspectRatio: PREVIEW_ASPECT }]}
                contentFit="contain"
                contentPosition="center"
              />
              <View style={styles.playOverlay} pointerEvents="none">
                <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
              </View>
            </>
          ) : (
            <ExerciseVideoBanner
              source={previewFallbackVideo ?? PLACEHOLDER_PREVIEW_VIDEO}
              aspectRatio={PREVIEW_ASPECT}
              previewContentFit="contain"
            />
          )}
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {name}
        </Text>
      </View>
      <View style={styles.repBadge}>
        <Text style={styles.repText}>{repLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  body: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  previewWrap: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: EXERCISE_VIDEO_FRAME_BACKGROUND,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    minHeight: 112,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000000',
    textAlign: 'center',
    textTransform: 'uppercase',
    ...font('medium'),
    paddingHorizontal: 8,
    minHeight: 28,
  },
  repBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    minWidth: 37,
    height: 26,
    backgroundColor: '#6B7280',
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  repText: {
    fontSize: 14,
    color: '#F9FAFB',
    ...font('medium'),
  },
});
