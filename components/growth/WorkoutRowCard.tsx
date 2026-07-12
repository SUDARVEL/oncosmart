import { CachedMediaImage } from '../CachedMediaImage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { LevelWorkout } from '../../lib/getLevelWorkouts';
import { getWorkoutGrowthPlaceholderFit } from '../../lib/workoutGrowthPlaceholders';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { PressableScale } from '../PressableScale';
import { GrowthPlaceholderSvg } from './GrowthPlaceholderSvg';

type WorkoutRowCardProps = {
  workout: LevelWorkout;
  onPress: () => void;
};

/** Figma Growth row thumbnail — matches Male Workouts placeholder SVGs. */
const PHOTO_WIDTH = 66;
const PHOTO_HEIGHT = 70;

function getRemoteUri(source: LevelWorkout['photoSource']): string | null {
  if (!source || typeof source === 'number') return null;
  if (typeof source === 'object' && 'uri' in source && typeof source.uri === 'string') {
    return source.uri;
  }
  return null;
}

export function WorkoutRowCard({ workout, onPress }: WorkoutRowCardProps) {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);
  const remoteUri = useMemo(() => getRemoteUri(workout.photoSource), [workout.photoSource]);
  const isSvg = Boolean(remoteUri?.toLowerCase().includes('.svg'));
  const showPhoto = Boolean(workout.photoSource) && !imageFailed;
  const svgFit = useMemo(
    () => (isSvg ? getWorkoutGrowthPlaceholderFit(workout.id) : null),
    [isSvg, workout.id],
  );
  const handleImageError = useCallback(() => setImageFailed(true), []);

  useEffect(() => {
    setImageFailed(false);
  }, [workout.id, workout.photoSource]);

  return (
    <PressableScale
      style={styles.card}
      pressedScale={0.985}
      pressedOpacity={0.94}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t(workout.titleKey)}
    >
      <View style={styles.photoWrap}>
        {showPhoto && isSvg && remoteUri ? (
          <View style={styles.svgClip}>
            <GrowthPlaceholderSvg
              uri={remoteUri}
              width={PHOTO_WIDTH}
              height={PHOTO_HEIGHT}
              fit={svgFit}
              onError={handleImageError}
            />
          </View>
        ) : showPhoto ? (
          <CachedMediaImage
            source={workout.photoSource!}
            style={styles.photo}
            contentFit="cover"
            contentPosition="center"
            recyclingKey={`growth-row-${workout.id}`}
            onError={handleImageError}
          />
        ) : null}
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{t(workout.titleKey)}</Text>
        <Text style={styles.description}>{t(workout.descriptionKey)}</Text>
      </View>
    </PressableScale>
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
  photoWrap: {
    width: PHOTO_WIDTH,
    height: PHOTO_HEIGHT,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgClip: {
    width: PHOTO_WIDTH,
    height: PHOTO_HEIGHT,
    overflow: 'hidden',
    borderRadius: 60,
  },
  photo: {
    width: PHOTO_WIDTH,
    height: PHOTO_HEIGHT,
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
