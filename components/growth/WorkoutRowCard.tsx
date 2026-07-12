import { CachedMediaImage } from '../CachedMediaImage';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LevelWorkout } from '../../lib/getLevelWorkouts';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

type WorkoutRowCardProps = {
  workout: LevelWorkout;
  onPress: () => void;
};

/** Figma Growth row thumbnail. */
const PHOTO_WIDTH = 66;
const PHOTO_HEIGHT = 70;

type ThumbCrop = {
  /** How much to enlarge the still inside the oval. */
  zoom: number;
  /** Vertical focal point in the source (0 = top, 100 = bottom). */
  focusY: number;
};

/**
 * Studio stills are full-body with empty grey above / around the figure.
 * Floor poses sit near the bottom of the frame; standing poses sit mid-upper.
 */
function getGrowthThumbCrop(exerciseId: string): ThumbCrop {
  if (
    exerciseId.includes('knee-to-chest') ||
    exerciseId.includes('straight-leg-raise') ||
    exerciseId.includes('hamstring') ||
    exerciseId === 'ankle-pumps' ||
    exerciseId === 'diaphragmatic-breathing' ||
    exerciseId.includes('calf-stretch')
  ) {
    return { zoom: 2.45, focusY: 78 };
  }

  if (
    exerciseId.includes('static-quadriceps') ||
    exerciseId === 'sit-to-stand' ||
    exerciseId.includes('quadriceps-stretch')
  ) {
    return { zoom: 2.35, focusY: 48 };
  }

  // Standing / upper-body work — keep head + torso in frame
  return { zoom: 2.35, focusY: 34 };
}

export function WorkoutRowCard({ workout, onPress }: WorkoutRowCardProps) {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);
  const showPhoto = Boolean(workout.photoSource) && !imageFailed;
  const crop = useMemo(() => getGrowthThumbCrop(workout.id), [workout.id]);

  const photoStyle = useMemo(() => {
    const width = PHOTO_WIDTH * crop.zoom;
    const height = PHOTO_HEIGHT * crop.zoom;
    return {
      position: 'absolute' as const,
      width,
      height,
      left: (PHOTO_WIDTH - width) / 2,
      // Pin the focal point of the still to the vertical center of the oval
      top: PHOTO_HEIGHT / 2 - (crop.focusY / 100) * height,
    };
  }, [crop]);

  useEffect(() => {
    setImageFailed(false);
  }, [workout.id, workout.photoSource]);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t(workout.titleKey)}
    >
      <View style={styles.photoWrap}>
        {showPhoto ? (
          <CachedMediaImage
            source={workout.photoSource!}
            style={photoStyle}
            contentFit="cover"
            contentPosition="center"
            recyclingKey={`growth-row-${workout.id}`}
            onError={() => setImageFailed(true)}
          />
        ) : null}
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{t(workout.titleKey)}</Text>
        <Text style={styles.description}>{t(workout.descriptionKey)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: 326,
    minHeight: 85,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
  },
  cardPressed: {
    backgroundColor: '#F9FAFB',
  },
  photoWrap: {
    width: PHOTO_WIDTH,
    height: PHOTO_HEIGHT,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#D1D5DB',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
    color: '#262526',
    textTransform: 'uppercase',
    ...font('medium'),
  },
  description: {
    fontSize: 12,
    lineHeight: 20,
    color: colors.textMuted,
    letterSpacing: 0.25,
    ...font('regular'),
  },
});
