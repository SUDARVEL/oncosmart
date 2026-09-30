import type { ImageSource } from 'expo-image';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { CachedMediaImage } from '../CachedMediaImage';
import { SessionCardLoopVideo } from './SessionCardLoopVideo';
import {
  SESSION_EXERCISE_CARD_HEIGHT,
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
  /** Only mount the looping video when the card is on-screen (avoids blank players). */
  isActive?: boolean;
};

function formatRepBadge(repLabel: string): string {
  const trimmed = repLabel.trim();
  if (/^x\d+/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return trimmed;
}

/**
 * Figma day-session card — 257×112 landscape stage.
 * Still poster underneath when available; looping video only for on-screen cards.
 */
export function ExerciseSessionCard({
  name,
  repLabel,
  previewPhoto,
  previewVideo,
  exerciseId,
  isActive = true,
}: Props) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
    setPhotoFailed(false);
  }, [previewVideo, previewPhoto, exerciseId]);

  const hasPoster = Boolean(previewPhoto) && !photoFailed;
  // Cap concurrent expo-video players: only mount when the card is viewable.
  const showVideo = Boolean(previewVideo) && !videoFailed && isActive;

  return (
    <View style={styles.card} accessibilityRole="text">
      <View style={styles.body}>
        <View style={styles.previewStage}>
          {hasPoster ? (
            <CachedMediaImage
              source={previewPhoto!}
              style={styles.previewMedia}
              contentFit="cover"
              contentPosition="center"
              recyclingKey={`session-card-${exerciseId}`}
              cachePolicy="memory-disk"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <View style={styles.previewPlaceholder} />
          )}
          {showVideo ? (
            <View style={styles.videoOverlay} pointerEvents="none">
              <SessionCardLoopVideo
                uri={previewVideo!}
                onFailed={() => setVideoFailed(true)}
              />
            </View>
          ) : null}
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
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
    }),
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
  previewStage: {
    width: SESSION_EXERCISE_CARD_PREVIEW_WIDTH,
    height: SESSION_EXERCISE_CARD_PREVIEW_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#D1D5DB',
  },
  previewMedia: {
    ...StyleSheet.absoluteFillObject,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  previewPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D1D5DB',
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
