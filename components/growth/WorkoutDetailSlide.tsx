import { CachedMediaImage } from '../CachedMediaImage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { WorkoutDetail } from '../../lib/getWorkoutDetails';
import { getWorkoutRepLabel } from '../../lib/getWorkoutRepLabel';
import {
  WORKOUT_SLIDER_BODY_HEIGHT,
  WORKOUT_SLIDER_MEDIA_HEIGHT,
  WORKOUT_SLIDER_MEDIA_RADIUS,
  WORKOUT_SLIDER_MEDIA_WIDTH,
} from '../../lib/workoutInfoSheetLayout';
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
      <ScrollView
        key={workout.id}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mediaWrap}>
          {showPhoto ? (
            <CachedMediaImage
              source={workout.photoSource!}
              style={styles.media}
              contentFit="contain"
              contentPosition="center"
              recyclingKey={workout.id}
              priority="high"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <View style={styles.mediaPlaceholder} />
          )}
        </View>

        <Text style={styles.exerciseTitle}>{title}</Text>

        <View style={styles.repRow}>
          <Text style={styles.repValue} numberOfLines={1}>
            {workout.displayValue}
          </Text>
          <Text style={styles.repLabel} numberOfLines={1}>
            {repLabel}
          </Text>
        </View>

        <Text style={styles.description}>{description}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    height: WORKOUT_SLIDER_BODY_HEIGHT,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    /** Keep last lines clear of the sheet chrome while scrolling */
    paddingBottom: 28,
  },
  mediaWrap: {
    width: WORKOUT_SLIDER_MEDIA_WIDTH,
    height: WORKOUT_SLIDER_MEDIA_HEIGHT,
    borderRadius: WORKOUT_SLIDER_MEDIA_RADIUS,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  media: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  mediaPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  exerciseTitle: {
    marginTop: 14,
    width: WORKOUT_SLIDER_MEDIA_WIDTH,
    fontSize: 22,
    lineHeight: 26,
    color: '#262526',
    textAlign: 'center',
    textTransform: 'uppercase',
    ...font('semiBold'),
  },
  repRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    minHeight: 52,
  },
  repValue: {
    fontSize: 52,
    lineHeight: 52,
    color: '#00131F',
    ...displayFontStyle(),
  },
  repLabel: {
    fontSize: 30,
    lineHeight: 34,
    color: '#00131F',
    marginBottom: 2,
    ...displayFontStyle(),
  },
  /** Figma Grey-80 description: 16 / 20 / 0.1, weight 400 */
  description: {
    marginTop: 12,
    width: WORKOUT_SLIDER_MEDIA_WIDTH,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: '#6B7280',
    textAlign: 'center',
    ...font('regular'),
  },
});
