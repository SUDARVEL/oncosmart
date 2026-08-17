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
  WORKOUT_SLIDER_MEDIA_TOP,
  WORKOUT_SLIDER_MEDIA_WIDTH,
} from '../../lib/workoutInfoSheetLayout';
import { ExercisePlayerCopyBlock } from '../exercise/ExercisePlayerCopyBlock';

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
              /**
               * Figma media frame is 349×446 at the source aspect. Use contain so the
               * whole character (legs/feet) stays visible — never crop or widen.
               */
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

        <ExercisePlayerCopyBlock
          title={title}
          description={description}
          displayValue={workout.displayValue}
          unitLabel={repLabel}
        />
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
  /** Figma content inset ~20.5; media top 10.5 */
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20.5,
    paddingTop: WORKOUT_SLIDER_MEDIA_TOP,
    paddingBottom: 16,
  },
  /** Fixed Figma 349×446 portrait frame — never use circular Growth thumbs here. */
  mediaWrap: {
    width: WORKOUT_SLIDER_MEDIA_WIDTH,
    height: WORKOUT_SLIDER_MEDIA_HEIGHT,
    borderRadius: WORKOUT_SLIDER_MEDIA_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
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
});
