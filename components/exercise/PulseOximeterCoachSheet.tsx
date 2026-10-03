import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getPulseOximeterCoachImageUrl,
  getPulseOximeterCoachImageUrls,
  PULSE_OXIMETER_COACH_STEP_COUNT,
  type PulseOximeterMediaGender,
} from '../../lib/pulseOximeterCoach';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { CachedMediaImage } from '../CachedMediaImage';

type Props = {
  visible: boolean;
  mediaGender: PulseOximeterMediaGender;
  /** Skip the guide and continue to the heart-rate check. */
  onSkip: () => void;
  /** Last step finished. Continue to the heart-rate check. */
  onDone: () => void;
  /** Close without continuing (back or tap outside). */
  onDismiss: () => void;
};

const STEPS = Array.from({ length: PULSE_OXIMETER_COACH_STEP_COUNT }, (_, index) => index + 1);
/** Title (2 lines) + body (3 lines) so Skip / Next stay put while copy length changes. */
const COPY_BLOCK_HEIGHT = 132;

/**
 * Bottom-sheet slider that replaces “Please wear your pulse oximeter”.
 * Layout follows the seven-step Measure Oxygen Level coach mark:
 * illustration, step count, title, body, dots, Skip, and Next / Done.
 */
export function PulseOximeterCoachSheet({
  visible,
  mediaGender,
  onSkip,
  onDone,
  onDismiss,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<number>>(null);
  const [index, setIndex] = useState(0);

  const imageHeight = Math.min(Math.round(width / 1.12), Math.round(height * 0.42));
  const isLast = index >= PULSE_OXIMETER_COACH_STEP_COUNT - 1;

  useEffect(() => {
    if (!visible) return;
    setIndex(0);
    const urls = getPulseOximeterCoachImageUrls(mediaGender);
    if (urls.length > 0) void Image.prefetch(urls);
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
    return () => cancelAnimationFrame(frame);
  }, [mediaGender, visible]);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(PULSE_OXIMETER_COACH_STEP_COUNT - 1, next));
      setIndex(clamped);
      listRef.current?.scrollToIndex({ index: clamped, animated: true });
    },
    [],
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const next = viewableItems[0]?.index;
      if (typeof next === 'number') setIndex(next);
    },
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next >= 0 && next < PULSE_OXIMETER_COACH_STEP_COUNT) setIndex(next);
  };

  const handleNext = () => {
    if (isLast) {
      onDone();
      return;
    }
    goTo(index + 1);
  };

  const renderItem = useCallback(
    ({ item }: { item: number }) => {
      const uri = getPulseOximeterCoachImageUrl(item, mediaGender);
      return (
        <View style={{ width }}>
          <View style={[styles.imageFrame, { height: imageHeight }]}>
            {uri ? (
              <CachedMediaImage
                source={{ uri }}
                style={styles.image}
                contentFit="cover"
                contentPosition="center"
                accessibilityIgnoresInvertColors
              />
            ) : null}
            <Text style={styles.stepCount}>
              {t('coach.stepOf', { current: item, total: PULSE_OXIMETER_COACH_STEP_COUNT })}
            </Text>
          </View>
          <View style={styles.copy}>
            <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
              {t(`daySession.oximeter${item}Title`)}
            </Text>
            <Text style={styles.body} numberOfLines={3}>
              {t(`daySession.oximeter${item}Body`)}
            </Text>
          </View>
        </View>
      );
    },
    [imageHeight, mediaGender, t, width],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={t('daySession.pulseCancel')}
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <FlatList
            ref={listRef}
            data={STEPS}
            keyExtractor={(step) => String(step)}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={width}
            snapToAlignment="start"
            disableIntervalMomentum
            getItemLayout={(_, itemIndex) => ({
              length: width,
              offset: width * itemIndex,
              index: itemIndex,
            })}
            onMomentumScrollEnd={handleScrollEnd}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            initialNumToRender={2}
            windowSize={3}
            onScrollToIndexFailed={({ index: failed }) => {
              requestAnimationFrame(() => {
                listRef.current?.scrollToIndex({ index: failed, animated: false });
              });
            }}
            style={{ height: imageHeight + COPY_BLOCK_HEIGHT }}
          />

          <View style={styles.dots}>
            {STEPS.map((step, stepIndex) => (
              <View
                key={step}
                style={[styles.dot, stepIndex === index && styles.dotActive]}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onSkip}
              style={styles.skipButton}
              accessibilityRole="button"
              accessibilityLabel={t('coach.skip')}
            >
              <Text style={styles.skipText}>{t('coach.skip')}</Text>
            </Pressable>
            <Pressable
              onPress={handleNext}
              style={styles.nextButton}
              accessibilityRole="button"
              accessibilityLabel={isLast ? t('coach.done') : t('coach.next')}
            >
              <Text style={styles.nextText}>{isLast ? t('coach.done') : t('coach.next')}</Text>
            </Pressable>
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
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 12,
  },
  imageFrame: {
    width: '100%',
    backgroundColor: '#AEB0B2',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.04 }],
  },
  stepCount: {
    position: 'absolute',
    top: 14,
    left: 16,
    fontSize: 13,
    lineHeight: 16,
    color: '#374151',
    ...font('medium'),
  },
  copy: {
    height: COPY_BLOCK_HEIGHT,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    color: '#111827',
    ...font('bold'),
  },
  body: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    ...font('regular'),
  },
  dots: {
    height: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: colors.buttonPrimary,
  },
  actions: {
    minHeight: 56,
    paddingTop: 8,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingRight: 16,
  },
  skipText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#111827',
    ...font('semiBold'),
  },
  nextButton: {
    minHeight: 44,
    minWidth: 96,
    paddingHorizontal: 28,
    borderRadius: 22,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    ...font('semiBold'),
  },
});
