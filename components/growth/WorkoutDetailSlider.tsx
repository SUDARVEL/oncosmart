import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { WorkoutDetail } from '../../lib/getWorkoutDetails';
import { WORKOUT_INFO_SLIDE_BODY_HEIGHT } from '../../lib/workoutInfoSheetLayout';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { WorkoutDetailSlide } from './WorkoutDetailSlide';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SLIDE_WIDTH = SCREEN_WIDTH;

type Props = {
  visible: boolean;
  workouts: WorkoutDetail[];
  initialIndex: number;
  onClose: () => void;
};

export function WorkoutDetailSlider({
  visible,
  workouts,
  initialIndex,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const dotsRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (!visible) return;

    setActiveIndex(initialIndex);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        x: initialIndex * SLIDE_WIDTH,
        animated: false,
      });
      dotsRef.current?.scrollTo({
        x: Math.max(0, initialIndex * 14 - SCREEN_WIDTH / 2),
        animated: false,
      });
    });
  }, [initialIndex, visible]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SLIDE_WIDTH);
    setActiveIndex(index);
    dotsRef.current?.scrollTo({
      x: Math.max(0, index * 14 - SCREEN_WIDTH / 2),
      animated: true,
    });
  };

  if (workouts.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} accessibilityRole="button" />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('growth.workouts.exerciseInfoTitle')}</Text>
            <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button">
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onMomentumScrollEnd={handleScrollEnd}
            style={styles.pager}
            contentContainerStyle={styles.pagerContent}
          >
            {workouts.map((workout) => (
              <WorkoutDetailSlide key={workout.id} workout={workout} width={SLIDE_WIDTH} />
            ))}
          </ScrollView>

          {workouts.length <= 15 ? (
            <View style={styles.dotsContent}>
              {workouts.map((workout, index) => (
                <View
                  key={workout.id}
                  style={[styles.dot, activeIndex === index && styles.dotActive]}
                />
              ))}
            </View>
          ) : (
            <ScrollView
              ref={dotsRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dotsContent}
              style={styles.dotsScroller}
            >
              {workouts.map((workout, index) => (
                <View
                  key={workout.id}
                  style={[styles.dot, activeIndex === index && styles.dotActive]}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropTap: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  dragHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    lineHeight: 28,
    color: '#374151',
    ...font('medium'),
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  pager: {
    height: WORKOUT_INFO_SLIDE_BODY_HEIGHT,
  },
  pagerContent: {
    alignItems: 'flex-start',
  },
  dotsScroller: {
    maxHeight: 28,
    marginTop: 8,
  },
  dotsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.dotInactive,
  },
  dotActive: {
    backgroundColor: colors.dotActive,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
