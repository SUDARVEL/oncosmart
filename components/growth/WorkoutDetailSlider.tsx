import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { WorkoutDetail } from '../../lib/getWorkoutDetails';
import { colors } from '../../theme/colors';
import { WorkoutDetailSlide } from './WorkoutDetailSlide';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const DOTS_AREA_HEIGHT = 44;

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
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<WorkoutDetail>>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const slideHeight = useMemo(
    () => SCREEN_HEIGHT - insets.top - insets.bottom - DOTS_AREA_HEIGHT,
    [insets.bottom, insets.top],
  );

  useEffect(() => {
    if (!visible || workouts.length === 0) return;

    setActiveIndex(initialIndex);
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [initialIndex, visible, workouts.length]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const index = viewableItems[0]?.index;
      if (typeof index === 'number') {
        setActiveIndex(index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const getItemLayout = useCallback(
    (_: ArrayLike<WorkoutDetail> | null | undefined, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    [],
  );

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index >= 0 && index < workouts.length) {
      setActiveIndex(index);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: WorkoutDetail }) => (
      <View style={{ width: SCREEN_WIDTH, height: slideHeight }}>
        <WorkoutDetailSlide workout={item} width={SCREEN_WIDTH} />
      </View>
    ),
    [slideHeight],
  );

  const keyExtractor = useCallback((item: WorkoutDetail) => item.id, []);

  if (workouts.length === 0) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Pressable
          onPress={onClose}
          style={[styles.closeButton, { top: insets.top + 8 }]}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={24} color="#374151" />
        </Pressable>

        <FlatList
          ref={listRef}
          data={workouts}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          decelerationRate="fast"
          snapToInterval={SCREEN_WIDTH}
          snapToAlignment="start"
          disableIntervalMomentum
          getItemLayout={getItemLayout}
          initialScrollIndex={Math.min(initialIndex, workouts.length - 1)}
          onMomentumScrollEnd={handleScrollEnd}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          style={[styles.pager, { height: slideHeight }]}
          windowSize={3}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          removeClippedSubviews
          onScrollToIndexFailed={({ index }) => {
            requestAnimationFrame(() => {
              listRef.current?.scrollToIndex({ index, animated: false });
            });
          }}
        />

        <View style={styles.dotsRow}>
          {workouts.map((workout, index) => (
            <View
              key={workout.id}
              style={[styles.dot, activeIndex === index && styles.dotActive]}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  pager: {
    flexGrow: 0,
  },
  dotsRow: {
    height: DOTS_AREA_HEIGHT,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
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
