import { CachedMediaImage } from '../CachedMediaImage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { WorkoutDetail } from '../../lib/getWorkoutDetails';
import { getWorkoutRepLabel } from '../../lib/getWorkoutRepLabel';
import {
  WORKOUT_SLIDER_BODY_HEIGHT,
  WORKOUT_SLIDER_MEDIA_BACKGROUND,
  WORKOUT_SLIDER_MEDIA_HEIGHT,
  WORKOUT_SLIDER_MEDIA_RADIUS,
  WORKOUT_SLIDER_MEDIA_WIDTH,
  WORKOUT_SLIDER_TEXT_BLOCK_HEIGHT,
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
  const showPhoto = Boolean(workout.photoSource) && !imageFailed;
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
        <Text style={styles.exerciseTitle} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.repRow}>
          <Text style={styles.repValue}>{workout.displayValue}</Text>
          <Text style={styles.repLabel}>{repLabel}</Text>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    height: WORKOUT_SLIDER_BODY_HEIGHT,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    overflow: 'hidden',
  },
  mediaWrap: {
    width: WORKOUT_SLIDER_MEDIA_WIDTH,
    height: WORKOUT_SLIDER_MEDIA_HEIGHT,
    borderRadius: WORKOUT_SLIDER_MEDIA_RADIUS,
    overflow: 'hidden',
    backgroundColor: WORKOUT_SLIDER_MEDIA_BACKGROUND,
  },
  media: {
    width: '100%',
    height: '100%',
    backgroundColor: WORKOUT_SLIDER_MEDIA_BACKGROUND,
  },
  mediaPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: WORKOUT_SLIDER_MEDIA_BACKGROUND,
  },
  textBlock: {
    height: WORKOUT_SLIDER_TEXT_BLOCK_HEIGHT - 8,
    width: WORKOUT_SLIDER_MEDIA_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    overflow: 'hidden',
  },
  exerciseTitle: {
    fontSize: 20,
    lineHeight: 24,
    color: '#262526',
    textAlign: 'center',
    textTransform: 'uppercase',
    ...font('semiBold'),
  },
  repRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    minHeight: 48,
  },
  repValue: {
    fontSize: 48,
    lineHeight: 48,
    color: '#00131F',
    ...displayFontStyle(),
  },
  repLabel: {
    fontSize: 28,
    lineHeight: 32,
    color: '#00131F',
    marginBottom: 2,
    ...displayFontStyle(),
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
    ...font('regular'),
  },
});
