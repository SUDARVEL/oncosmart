import { CachedMediaImage } from '../CachedMediaImage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { WorkoutDetail } from '../../lib/getWorkoutDetails';
import { getWorkoutRepLabel } from '../../lib/getWorkoutRepLabel';
import {
  WORKOUT_SLIDER_BODY_HEIGHT,
  WORKOUT_SLIDER_MEDIA_ASPECT,
  WORKOUT_SLIDER_MEDIA_RADIUS,
  WORKOUT_SLIDER_MEDIA_TOP,
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
  /** Figma content inset ~20.5; media top 10.5 */
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20.5,
    paddingTop: WORKOUT_SLIDER_MEDIA_TOP,
    paddingBottom: 16,
  },
  /** Fixed Figma 349-wide, 349:446 portrait aspect — width never increased. */
  mediaWrap: {
    width: WORKOUT_SLIDER_MEDIA_WIDTH,
    aspectRatio: WORKOUT_SLIDER_MEDIA_ASPECT,
    borderRadius: WORKOUT_SLIDER_MEDIA_RADIUS,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: WORKOUT_SLIDER_MEDIA_RADIUS,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  mediaPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: WORKOUT_SLIDER_MEDIA_RADIUS,
    backgroundColor: '#F3F4F6',
  },
  /** Figma: 24 semiBold, #262526 */
  exerciseTitle: {
    marginTop: 14,
    width: WORKOUT_SLIDER_MEDIA_WIDTH,
    fontSize: 24,
    lineHeight: 28,
    color: '#262526',
    textAlign: 'center',
    textTransform: 'uppercase',
    ...font('semiBold'),
  },
  repRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    minHeight: 72,
  },
  /** Figma Antonio Bold 64 / #00131F */
  repValue: {
    fontSize: 64,
    lineHeight: 72,
    color: '#00131F',
    ...displayFontStyle(),
  },
  /**
   * Unit (முறை / நிமி / வினாடி / REPS): use the Tamil-capable font, not Antonio
   * (which lacks Tamil glyphs and clips the label). Taller line height keeps
   * descenders like "றை" fully visible on one line.
   */
  repLabel: {
    fontSize: 34,
    lineHeight: 44,
    color: '#00131F',
    ...font('bold'),
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
