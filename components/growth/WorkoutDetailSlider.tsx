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
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (!visible) return;

    setActiveIndex(initialIndex);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        x: initialIndex * SLIDE_WIDTH,
        animated: false,
      });
    });
  }, [initialIndex, visible]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SLIDE_WIDTH);
    setActiveIndex(index);
  };

  if (workouts.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} accessibilityRole="button" />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('growth.workouts.exerciseInfoTitle')}</Text>
            <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button">
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
          </View>

          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onMomentumScrollEnd={handleScrollEnd}
            style={styles.slider}
            contentContainerStyle={styles.sliderContent}
          >
            {workouts.map((workout) => (
              <WorkoutDetailSlide key={workout.id} workout={workout} width={SLIDE_WIDTH} />
            ))}
          </ScrollView>

          {workouts.length <= 15 ? (
            <View style={styles.dots}>
              {workouts.map((workout, index) => (
                <View
                  key={workout.id}
                  style={[styles.dot, activeIndex === index && styles.dotActive]}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.counter}>
              {t('growth.workouts.counter', {
                current: activeIndex + 1,
                total: workouts.length,
              })}
            </Text>
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
    maxHeight: '92%',
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
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 28,
    color: '#374151',
    ...font('medium'),
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slider: {
    flexGrow: 0,
  },
  sliderContent: {
    alignItems: 'flex-start',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexWrap: 'wrap',
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
  counter: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
    ...font('regular'),
  },
});
