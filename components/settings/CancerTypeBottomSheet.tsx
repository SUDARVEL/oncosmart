import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CachedMediaImage } from '../CachedMediaImage';
import {
  CANCER_TYPE_ART,
  CANCER_TYPE_I18N_KEYS,
  CANCER_TYPE_SLUGS,
  normalizeCancerTypeSlug,
  type CancerTypeSlug,
} from '../../lib/cancerPathway';
import { getPublicStorageUrl } from '../../lib/supabaseStorage';
import { colors } from '../../theme/colors';
import { uiText } from '../../theme/typography';

type Props = {
  visible: boolean;
  selected: CancerTypeSlug | null;
  onClose: () => void;
  onSelect: (slug: CancerTypeSlug) => void;
};

const CARD_GAP = 14;

export function CancerTypeBottomSheet({ visible, selected, onClose, onSelect }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<CancerTypeSlug>>(null);
  const cardWidth = Math.min(260, width - 88);
  const stride = cardWidth + CARD_GAP;
  const sidePad = (width - cardWidth) / 2;
  const selectedIndex = Math.max(
    0,
    CANCER_TYPE_SLUGS.findIndex((slug) => slug === selected),
  );
  const [index, setIndex] = useState(selectedIndex);

  useEffect(() => {
    if (!visible) return;
    setIndex(selectedIndex);
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: selectedIndex * stride,
        animated: false,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedIndex, stride, visible]);

  const scrollTo = (next: number) => {
    const clamped = Math.max(0, Math.min(CANCER_TYPE_SLUGS.length - 1, next));
    setIndex(clamped);
    listRef.current?.scrollToOffset({ offset: clamped * stride, animated: true });
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / stride);
    if (next >= 0 && next < CANCER_TYPE_SLUGS.length) setIndex(next);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('pain.close')}
        />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handleHitArea}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('settings.cancerPathway')}</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t('pain.close')}
            >
              <Ionicons name="close" size={22} color="#374151" />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>{t('settings.cancerPathwayDescription')}</Text>

          <FlatList
            ref={listRef}
            data={CANCER_TYPE_SLUGS}
            keyExtractor={(slug) => slug}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToOffsets={CANCER_TYPE_SLUGS.map((_, itemIndex) => itemIndex * stride)}
            snapToAlignment="start"
            disableIntervalMomentum
            contentContainerStyle={{
              paddingLeft: sidePad,
              paddingRight: Math.max(0, sidePad - CARD_GAP),
              paddingVertical: 4,
            }}
            onMomentumScrollEnd={onScrollEnd}
            getItemLayout={(_, itemIndex) => ({
              length: stride,
              offset: stride * itemIndex,
              index: itemIndex,
            })}
            renderItem={({ item: slug }) => {
              const isSelected = selected === slug;
              const art = CANCER_TYPE_ART[slug];
              const uri = getPublicStorageUrl(art.path);
              return (
                <View style={{ width: stride }}>
                  <Pressable
                    onPress={() => onSelect(slug)}
                    style={[styles.card, { width: cardWidth }, isSelected && styles.cardSelected]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.iconWrap}>
                      {uri ? (
                        <CachedMediaImage
                          source={{ uri }}
                          style={[styles.icon, { transform: [{ scale: art.scale }] }]}
                          contentFit="contain"
                          accessibilityIgnoresInvertColors
                        />
                      ) : null}
                    </View>
                    <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                      {t(CANCER_TYPE_I18N_KEYS[slug])}
                    </Text>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected ? <View style={styles.radioDot} /> : null}
                    </View>
                  </Pressable>
                </View>
              );
            }}
          />

          <View style={styles.dots}>
            {CANCER_TYPE_SLUGS.map((slug, dotIndex) => (
              <Pressable
                key={slug}
                onPress={() => scrollTo(dotIndex)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t(CANCER_TYPE_I18N_KEYS[slug])}
              >
                <View style={[styles.dot, dotIndex === index && styles.dotActive]} />
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** Current slug from persisted profile (supports legacy free-text). */
export function selectedCancerSlugFromStore(raw: string): CancerTypeSlug | null {
  return normalizeCancerTypeSlug(raw);
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
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    gap: 12,
  },
  handleHitArea: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    flex: 1,
    ...uiText(18, 'semiBold'),
    color: colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    ...uiText(14),
    color: colors.textSecondary,
    paddingHorizontal: 20,
  },
  card: {
    minHeight: 248,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  cardSelected: {
    borderColor: colors.buttonPrimary,
    backgroundColor: colors.cardSelectedBg,
  },
  iconWrap: {
    width: 132,
    height: 132,
    borderRadius: 66,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDECEF',
  },
  icon: {
    width: 132,
    height: 132,
  },
  cardLabel: {
    ...uiText(16, 'medium'),
    textAlign: 'center',
    color: '#1F2937',
    minHeight: 46,
  },
  cardLabelSelected: {
    ...uiText(16, 'semiBold'),
    color: colors.navy,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioSelected: {
    borderColor: colors.buttonPrimary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.buttonPrimary,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
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
});
