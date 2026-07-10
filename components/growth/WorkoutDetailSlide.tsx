import { CachedMediaImage } from '../CachedMediaImage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { WorkoutDetail } from '../../lib/getWorkoutDetails';
import { getWorkoutRepLabel } from '../../lib/getWorkoutRepLabel';
import {
  WORKOUT_SLIDER_IMAGE_BOTTOM_RADIUS,
  WORKOUT_SLIDER_IMAGE_HEIGHT,
  WORKOUT_SLIDER_IMAGE_WIDTH,
} from '../../lib/workoutInfoSheetLayout';
import { colors } from '../../theme/colors';
import { displayFontStyle, font } from '../../theme/fonts';

type Props = {
  workout: WorkoutDetail;
  width: number;
};

export function WorkoutDetailSlide({ workout, width }: Props) {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);
  const title = t(`sessionFlow.exercises.${workout.id}.title`);
  const description = t(`sessionFlow.exercises.${workout.id}.description`);
  const showPhoto = workout.photoSource && !imageFailed;
  const repLabel = getWorkoutRepLabel(workout, t);

  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.mediaWrap}>
        {showPhoto ? (
          <CachedMediaImage
            source={workout.photoSource!}
            style={styles.media}
            contentFit="cover"
            contentPosition="center"
            recyclingKey={workout.id}
            priority="high"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.mediaPlaceholder} />
        )}
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.exerciseTitle}>{title}</Text>

        <View style={styles.repRow}>
          <Text style={styles.repValue}>{workout.displayValue}</Text>
          <Text style={styles.repLabel}>{repLabel}</Text>
        </View>

        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
  },
  mediaWrap: {
    width: WORKOUT_SLIDER_IMAGE_WIDTH,
    height: WORKOUT_SLIDER_IMAGE_HEIGHT,
    overflow: 'hidden',
    borderBottomLeftRadius: WORKOUT_SLIDER_IMAGE_BOTTOM_RADIUS,
    borderBottomRightRadius: WORKOUT_SLIDER_IMAGE_BOTTOM_RADIUS,
    backgroundColor: '#E8E8E8',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  textBlock: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 8,
  },
  exerciseTitle: {
    fontSize: 28,
    lineHeight: 34,
    color: '#111111',
    textAlign: 'center',
    textTransform: 'uppercase',
    ...displayFontStyle(),
  },
  repRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
  },
  repValue: {
    fontSize: 64,
    lineHeight: 64,
    color: '#00131F',
    ...displayFontStyle(),
  },
  repLabel: {
    fontSize: 36,
    lineHeight: 40,
    color: '#00131F',
    ...displayFontStyle(),
    marginBottom: 6,
  },
  description: {
    marginTop: 20,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 320,
    ...font('regular'),
  },
});
