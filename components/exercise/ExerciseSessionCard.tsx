import type { ImageSource } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { CachedMediaImage } from '../CachedMediaImage';
import { SessionCardLoopVideo } from './SessionCardLoopVideo';
import {
  SESSION_EXERCISE_CARD_HEIGHT,
  SESSION_EXERCISE_CARD_PREVIEW_BACKGROUND,
  SESSION_EXERCISE_CARD_PREVIEW_HEIGHT,
  SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
} from '../../lib/exerciseVideoFrame';
import { font } from '../../theme/fonts';

type Props = {
  name: string;
  repLabel: string;
  previewPhoto: ImageSource | null;
  previewVideo: string | null;
  exerciseId: string;
};

function formatRepBadge(repLabel: string): string {
  const trimmed = repLabel.trim();
  if (/^x\d+/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return trimmed;
}

/** Figma day-session card — 180px shell, fixed 257×112 landscape media. */
export function ExerciseSessionCard({
  name,
  repLabel,
  previewPhoto,
  previewVideo,
  exerciseId,
}: Props) {
  return (
    <View style={styles.card} accessibilityRole="text">
      <View style={styles.body}>
        <View style={styles.previewWrap}>
          {previewVideo ? (
            <SessionCardLoopVideo uri={previewVideo} />
          ) : previewPhoto ? (
            <CachedMediaImage
              source={previewPhoto}
              style={styles.previewImage}
              contentFit="contain"
              contentPosition="center"
              recyclingKey={`session-card-${exerciseId}`}
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
        <Text style={styles.repText}>{formatRepBadge(repLabel)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: SESSION_EXERCISE_CARD_HEIGHT,
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  body: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewWrap: {
    width: SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
    height: SESSION_EXERCISE_CARD_PREVIEW_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: SESSION_EXERCISE_CARD_PREVIEW_BACKGROUND,
  },
  previewImage: {
    width: SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
    height: SESSION_EXERCISE_CARD_PREVIEW_HEIGHT,
  },
  previewPlaceholder: {
    width: SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
    height: SESSION_EXERCISE_CARD_PREVIEW_HEIGHT,
    backgroundColor: SESSION_EXERCISE_CARD_PREVIEW_BACKGROUND,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000000',
    textAlign: 'center',
    textTransform: 'uppercase',
    ...font('semiBold'),
    paddingHorizontal: 8,
  },
  repBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    minWidth: 44,
    height: 28,
    backgroundColor: '#6B7280',
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  repText: {
    fontSize: 14,
    color: '#F9FAFB',
    ...font('semiBold'),
  },
});
