import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { LevelWorkout } from '../../lib/getLevelWorkouts';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

type WorkoutRowCardProps = {
  workout: LevelWorkout;
};

export function WorkoutRowCard({ workout }: WorkoutRowCardProps) {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);
  const showPhoto = workout.photoSource && !imageFailed;

  return (
    <View style={styles.card}>
      <View style={styles.photoWrap}>
        {showPhoto ? (
          <Image
            source={workout.photoSource!}
            style={styles.photo}
            contentFit="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.photoPlaceholder} />
        )}
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{t(workout.titleKey)}</Text>
        <Text style={styles.description}>{t(workout.descriptionKey)}</Text>
      </View>
    </View>
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
    width: 66,
    height: 70,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  photo: {
    width: 66,
    height: 70,
  },
  photoPlaceholder: {
    flex: 1,
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
