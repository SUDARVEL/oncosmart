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
  getManualPulseGuideUrl,
  getPulseOximeterCoachImageUrl,
  getPulseOximeterCoachImageUrls,
  PULSE_OXIMETER_COACH_STEP_COUNT,
  PULSE_VALUE_MARK_STEP,
  type PulseOximeterMediaGender,
} from '../../lib/pulseOximeterCoach';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { uiText } from '../../theme/typography';
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

type MeasureMethod = 'manual' | 'oximeter';

const STEPS = Array.from({ length: PULSE_OXIMETER_COACH_STEP_COUNT }, (_, index) => index + 1);
/** Title (2 lines) + body (3 lines) so Skip / Next stay put while copy length changes. */
const COPY_BLOCK_HEIGHT = 124;
/** Matches the zoom on the coach illustration. */
const IMAGE_ZOOM = 1.04;
/** English wrist poster is 1024×1536. Tamil wrist poster is 1385×1136. */
const MANUAL_ASPECT_EN = 1536 / 1024;
const MANUAL_ASPECT_TA = 1136 / 1385;

/**
 * Bottom sheet for checking pulse before a session.
 * Manual method is one fitted poster. Oximeter method is the seven-step guide.
 */
export function PulseOximeterCoachSheet({
  visible,
  mediaGender,
  onSkip,
  onDone,
  onDismiss,
}: Props) {
  const { t } = useTranslation();
  const language = useAppStore((state) => state.language);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<number>>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [method, setMethod] = useState<MeasureMethod>('oximeter');

  const imageHeight = Math.min(Math.round(width / 1.15), Math.round(height * 0.36));
  const manualWidth = width - 32;
  const manualAspect = language === 'ta' ? MANUAL_ASPECT_TA : MANUAL_ASPECT_EN;
  const manualHeight = Math.min(
    Math.round(manualWidth * manualAspect),
    Math.round(height * 0.5),
  );
  indexRef.current = index;
  const isLast = index >= PULSE_OXIMETER_COACH_STEP_COUNT - 1;
  const finishLabel = method === 'manual' || isLast;

  useEffect(() => {
    if (!visible) return;
    setIndex(0);
    setMethod('oximeter');
    const urls = [
      ...getPulseOximeterCoachImageUrls(mediaGender, language),
      getManualPulseGuideUrl(mediaGender, language),
    ].filter((url): url is string => Boolean(url));
    if (urls.length > 0) void Image.prefetch(urls);
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
    return () => cancelAnimationFrame(frame);
  }, [language, mediaGender, visible]);

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
    if (method === 'manual' || isLast) {
      onDone();
      return;
    }
    goTo(index + 1);
  };

  useEffect(() => {
    if (!visible || method !== 'oximeter') return;
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: width * indexRef.current,
        animated: false,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [method, visible, width]);

  const selectMethod = (next: MeasureMethod) => {
    setMethod(next);
  };

  const renderItem = useCallback(
    ({ item }: { item: number }) => {
      const uri = getPulseOximeterCoachImageUrl(item, mediaGender, language);
      const showsHeartRateGuide = item === PULSE_VALUE_MARK_STEP;
      return (
        <View style={{ width }}>
          <View style={[styles.imageFrame, { height: imageHeight }]}>
            {uri ? (
              <CachedMediaImage
                source={{ uri }}
                style={showsHeartRateGuide ? styles.imageContain : styles.image}
                contentFit={showsHeartRateGuide ? 'contain' : 'cover'}
                contentPosition="center"
                accessibilityIgnoresInvertColors
              />
            ) : null}
            <View style={styles.stepPill}>
              <Text style={styles.stepCount}>
                {t('coach.stepOf', { current: item, total: PULSE_OXIMETER_COACH_STEP_COUNT })}
              </Text>
            </View>
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
    [imageHeight, language, mediaGender, t, width],
  );

  const manualUri = getManualPulseGuideUrl(mediaGender, language);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={t('daySession.pulseCancel')}
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{t('daySession.pulseCheckTitle')}</Text>

          <View style={styles.tabs}>
            {(['manual', 'oximeter'] as const).map((id) => {
              const selected = method === id;
              const label =
                id === 'manual' ? t('daySession.methodManual') : t('daySession.methodOximeter');
              return (
                <Pressable
                  key={id}
                  style={[styles.tab, selected && styles.tabSelected]}
                  onPress={() => selectMethod(id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[styles.tabText, selected && styles.tabTextSelected]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {method === 'oximeter' ? (
            <FlatList
              removeClippedSubviews={false}
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
          ) : (
            <View style={styles.manualWrap}>
              <View style={[styles.manualFrame, { width: manualWidth, height: manualHeight }]}>
                {manualUri ? (
                  <CachedMediaImage
                    source={{ uri: manualUri }}
                    style={styles.manualImage}
                    contentFit="contain"
                    contentPosition="center"
                    cachePolicy="none"
                    recyclingKey={manualUri}
                    accessibilityIgnoresInvertColors
                  />
                ) : null}
              </View>
              <View style={styles.manualCopy}>
                <Text style={styles.title} numberOfLines={2}>
                  {t('daySession.manualTitle')}
                </Text>
                <Text style={styles.body} numberOfLines={3}>
                  {t('daySession.manualBody')}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.dots}>
            {method === 'oximeter'
              ? STEPS.map((step, stepIndex) => (
                  <View
                    key={step}
                    style={[styles.dot, stepIndex === index && styles.dotActive]}
                  />
                ))
              : null}
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
              accessibilityLabel={finishLabel ? t('coach.done') : t('coach.next')}
            >
              <Text style={styles.nextText}>{finishLabel ? t('coach.done') : t('coach.next')}</Text>
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
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 10,
  },
  sheetTitle: {
    marginTop: 14,
    paddingHorizontal: 20,
    ...uiText(18, 'semiBold'),
    color: '#111827',
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
    padding: 4,
    gap: 4,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    minWidth: 0,
    minHeight: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tabSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    ...uiText(14, 'medium'),
    color: '#6B7280',
    textAlign: 'center',
  },
  tabTextSelected: {
    ...uiText(14, 'semiBold'),
    color: colors.navy,
  },
  imageFrame: {
    width: '100%',
    backgroundColor: '#E6E7EA',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    transform: [{ scale: IMAGE_ZOOM }],
  },
  imageContain: {
    width: '100%',
    height: '100%',
  },
  stepPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
  },
  stepCount: {
    ...uiText(12, 'semiBold'),
    color: '#374151',
  },
  copy: {
    height: COPY_BLOCK_HEIGHT,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  title: {
    ...uiText(18, 'semiBold'),
    color: '#111827',
  },
  body: {
    marginTop: 6,
    ...uiText(14, 'regular'),
    color: '#4B5563',
  },
  manualWrap: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  manualFrame: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E6E7EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualImage: {
    ...StyleSheet.absoluteFillObject,
  },
  manualCopy: {
    alignSelf: 'stretch',
    minHeight: 92,
    paddingTop: 14,
    paddingHorizontal: 4,
  },
  dots: {
    height: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.navy,
  },
  actions: {
    minHeight: 60,
    paddingTop: 6,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  skipButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingRight: 16,
  },
  skipText: {
    ...uiText(16, 'medium'),
    color: '#4B5563',
  },
  nextButton: {
    minHeight: 44,
    minWidth: 108,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    ...uiText(16, 'semiBold'),
    color: '#FFFFFF',
  },
});
