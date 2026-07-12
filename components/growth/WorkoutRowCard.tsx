import { CachedMediaImage } from '../CachedMediaImage';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LevelWorkout } from '../../lib/getLevelWorkouts';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

type WorkoutRowCardProps = {
  workout: LevelWorkout;
  onPress: () => void;
};

/** Figma Growth row thumbnail — matches Male Workouts placeholder SVGs. */
const PHOTO_WIDTH = 66;
const PHOTO_HEIGHT = 70;

export function WorkoutRowCard({ workout, onPress }: WorkoutRowCardProps) {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);
  const showPhoto = Boolean(workout.photoSource) && !imageFailed;

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
            style={styles.photo}
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
