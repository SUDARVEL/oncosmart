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
import { SafeAreaView } from 'react-native-safe-area-context';

import type { WorkoutDetail } from '../../lib/getWorkoutDetails';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { WorkoutDetailSlide } from './WorkoutDetailSlide';

const SCREEN_WIDTH = Dimensions.get('window').width;

type Props = {
  visible: boolean;
  level: number;
  workouts: WorkoutDetail[];
  initialIndex: number;
  onClose: () => void;
};

export function WorkoutDetailSlider({
  visible,
  level,
  workouts,
  initialIndex,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (!visible) return;

    setActiveIndex(initialIndex);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        x: initialIndex * SCREEN_WIDTH,
        animated: false,
      });
    });
  }, [initialIndex, visible]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  if (workouts.length === 0) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.backButton} accessibilityRole="button">
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {t('growth.workouts.level', { level })}
          </Text>
          <Text style={styles.counter}>
            {t('growth.workouts.counter', {
              current: activeIndex + 1,
              total: workouts.length,
            })}
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScrollEnd}
          contentContainerStyle={styles.sliderContent}
        >
          {workouts.map((workout, index) => (
            <WorkoutDetailSlide
              key={workout.id}
              workout={workout}
              width={SCREEN_WIDTH}
            />
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
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    color: colors.textPrimary,
    ...font('medium'),
  },
  counter: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    paddingRight: 8,
    ...font('regular'),
  },
  sliderContent: {
    alignItems: 'flex-start',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
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
});
