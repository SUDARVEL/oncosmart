import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CachedMediaImage } from '../../components/CachedMediaImage';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import {
  CANCER_TYPE_ART,
  CANCER_TYPE_I18N_KEYS,
  CANCER_TYPE_SLUGS,
  normalizeCancerTypeSlug,
  type CancerTypeSlug,
} from '../../lib/cancerPathway';
import { isOnboardingReview, onboardingReviewHref } from '../../lib/onboardingReview';
import { getPublicStorageUrl } from '../../lib/supabaseStorage';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { uiText } from '../../theme/typography';

/** Cancer pathway picker — Breast / Thorax / Abdomen / Head & Neck. */
export default function CancerPathwayScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const review = isOnboardingReview(from);
  const savedCancerType = useAppStore((state) => state.cancerType);
  const setCancerType = useAppStore((state) => state.setCancerType);

  const initialSlug = useMemo(
    () => normalizeCancerTypeSlug(savedCancerType),
    [savedCancerType],
  );
  const [selected, setSelected] = useState<CancerTypeSlug | null>(initialSlug);

  const handleContinue = () => {
    if (!selected) return;
    setCancerType(selected);
    router.push(review ? onboardingReviewHref('/onboarding/treatment') : '/onboarding/treatment');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title={t('cancerPathway.header')} showBack largeTitle />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>{t('cancerPathway.title')}</Text>
          <Text style={styles.subtitle}>{t('cancerPathway.subtitle')}</Text>
        </View>

        <View style={styles.options}>
          {CANCER_TYPE_SLUGS.map((slug) => {
            const isSelected = selected === slug;
            const art = CANCER_TYPE_ART[slug];
            const uri = getPublicStorageUrl(art.path);
            return (
              <Pressable
                key={slug}
                onPress={() => setSelected(slug)}
                style={[styles.card, isSelected && styles.cardSelected]}
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
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={t('cancerPathway.continue')}
          onPress={handleContinue}
          disabled={!selected}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
    gap: 18,
  },
  intro: {
    gap: 8,
  },
  title: {
    ...uiText(22, 'semiBold'),
    color: colors.textPrimary,
  },
  subtitle: {
    ...uiText(14),
    color: colors.textMuted,
  },
  options: {
    gap: 12,
  },
  card: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  cardSelected: {
    borderColor: colors.buttonPrimary,
    backgroundColor: colors.cardSelectedBg,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDECEF',
  },
  icon: {
    width: 64,
    height: 64,
  },
  cardLabel: {
    flex: 1,
    ...uiText(16, 'medium'),
    color: '#1F2937',
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
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
});
