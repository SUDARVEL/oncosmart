import type { ImageSource } from 'expo-image';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

import { CachedMediaImage } from '../CachedMediaImage';
import {
  SESSION_EXERCISE_CARD_PREVIEW_ASPECT,
  SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
} from '../../lib/exerciseVideoFrame';
import { font } from '../../theme/fonts';

const CARD_HORIZONTAL_PADDING = 64;
const previewWidth = Math.min(
  Dimensions.get('window').width - CARD_HORIZONTAL_PADDING,
  SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
);
const previewHeight = previewWidth / SESSION_EXERCISE_CARD_PREVIEW_ASPECT;

type Props = {
  name: string;
  repLabel: string;
  previewPhoto: ImageSource | null;
  exerciseId: string;
};

/** Static preview card — display only; playback starts via Start Session. */
export function ExerciseSessionCard({ name, repLabel, previewPhoto, exerciseId }: Props) {
  return (
    <View style={styles.card} accessibilityRole="text">
      <View style={styles.body}>
        <View style={[styles.previewWrap, { width: previewWidth, height: previewHeight }]}>
          {previewPhoto ? (
            <CachedMediaImage
              source={previewPhoto}
              style={styles.previewImage}
              contentFit="contain"
              contentPosition="center"
              recyclingKey={exerciseId}
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={styles.previewPlaceholder} />
          )}
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {name}
        </Text>
      </View>
      <View style={styles.repBadge}>
        <Text style={styles.repText}>{repLabel}</Text>
      </View>
    </View>
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
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  previewPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F3F4F6',
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
