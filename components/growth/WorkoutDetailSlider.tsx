import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { WorkoutDetail } from '../../lib/getWorkoutDetails';
import {
  WORKOUT_SHEET_DOTS_HEIGHT,
  WORKOUT_SHEET_HEADER_HEIGHT,
  WORKOUT_SHEET_MAX_HEIGHT,
  WORKOUT_SHEET_SHADOW,
  WORKOUT_SHEET_TOP_RADIUS,
  WORKOUT_SLIDER_BODY_HEIGHT,
} from '../../lib/workoutInfoSheetLayout';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { WorkoutDetailSlide } from './WorkoutDetailSlide';

const SCREEN_WIDTH = Dimensions.get('window').width;

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
  const listRef = useRef<FlatList<WorkoutDetail>>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (!visible || workouts.length === 0) return;

    setActiveIndex(initialIndex);
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: Math.min(initialIndex, workouts.length - 1),
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
      <WorkoutDetailSlide workout={item} width={SCREEN_WIDTH} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: WorkoutDetail) => item.id, []);

  if (workouts.length === 0) return null;

  const bottomPad = Math.max(insets.bottom, 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        {/* Dimmed Growth screen behind the bottom sheet */}
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />

        {/* Shadow wrapper — overflow visible so SingleShadow-2 is not clipped */}
        <View
          style={[
            styles.sheetShadow,
            {
              height: WORKOUT_SHEET_MAX_HEIGHT + bottomPad,
              paddingBottom: bottomPad,
            },
          ]}
        >
          <View style={styles.sheet}>
            <View style={styles.handleHitArea} pointerEvents="none">
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.header}>
              <Text style={styles.headerTitle}>{t('growth.workouts.exerciseInfoTitle')}</Text>
              <Pressable
                onPress={onClose}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            <View style={styles.divider} />

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
              style={styles.pager}
              /** Allow vertical ScrollView inside each slide for long descriptions */
              nestedScrollEnabled
              windowSize={3}
              initialNumToRender={2}
              maxToRenderPerBatch={2}
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetShadow: {
    width: '100%',
    ...WORKOUT_SHEET_SHADOW,
  },
  sheet: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: WORKOUT_SHEET_TOP_RADIUS,
    borderTopRightRadius: WORKOUT_SHEET_TOP_RADIUS,
    overflow: 'hidden',
  },
  /** Figma handle: 40×4 at top 8, #D1D5DB, radius 16 — overlays header band */
  handleHitArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    alignItems: 'center',
    paddingTop: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
  },
  header: {
    height: WORKOUT_SHEET_HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  /** Figma Subtitle-1: 16 medium, #374151 */
  headerTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
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
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
  },
  pager: {
    height: WORKOUT_SLIDER_BODY_HEIGHT,
    overflow: 'hidden',
  },
  dotsRow: {
    height: WORKOUT_SHEET_DOTS_HEIGHT,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    zIndex: 2,
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
