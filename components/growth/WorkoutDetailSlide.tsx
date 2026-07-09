import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  EXERCISE_VIDEO_FRAME_BACKGROUND,
  EXERCISE_VIDEO_FRAME_BORDER_RADIUS,
  EXERCISE_VIDEO_FRAME_HEIGHT,
  EXERCISE_VIDEO_FRAME_WIDTH,
} from '../../lib/exerciseVideoFrame';
import type { WorkoutDetail } from '../../lib/getWorkoutDetails';
import { colors } from '../../theme/colors';
import { font, displayFontStyle } from '../../theme/fonts';

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

  const repLabel =
    workout.displayLabel === 'MINS'
      ? t('sessionFlow.minsLabel')
      : t('sessionFlow.repsLabel');

  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.mediaWrap}>
        {showPhoto ? (
          <Image
            source={workout.photoSource!}
            style={styles.media}
            contentFit="contain"
            contentPosition="center"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.mediaPlaceholder} />
        )}
      </View>

      <Text style={styles.exerciseTitle}>{title}</Text>

      <View style={styles.repRow}>
        <Text style={styles.repValue}>{workout.displayValue}</Text>
        <Text style={styles.repLabel}>{repLabel}</Text>
      </View>

      <Text style={styles.description}>{description}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  mediaWrap: {
    width: EXERCISE_VIDEO_FRAME_WIDTH,
    height: EXERCISE_VIDEO_FRAME_HEIGHT,
    borderRadius: EXERCISE_VIDEO_FRAME_BORDER_RADIUS,
    overflow: 'hidden',
    backgroundColor: EXERCISE_VIDEO_FRAME_BACKGROUND,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    flex: 1,
    backgroundColor: EXERCISE_VIDEO_FRAME_BACKGROUND,
  },
  exerciseTitle: {
    marginTop: 16,
    fontSize: 24,
    lineHeight: 28,
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
    marginTop: 16,
    minHeight: 64,
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
    marginTop: 16,
    fontSize: 16,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: EXERCISE_VIDEO_FRAME_WIDTH,
    ...font('regular'),
  },
});
