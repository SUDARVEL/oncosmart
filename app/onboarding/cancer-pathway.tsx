import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SelectOption } from '../../components/SelectOption';
import {
  CANCER_TYPE_I18N_KEYS,
  CANCER_TYPE_SLUGS,
  normalizeCancerTypeSlug,
  type CancerTypeSlug,
} from '../../lib/cancerPathway';
import { isOnboardingReview, onboardingReviewHref } from '../../lib/onboardingReview';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { uiText } from '../../theme/typography';

/**
 * Dedicated cancer pathway picker — Breast / Thorax / Abdomen / Head & Neck.
 * Combined with gender + language to load the matching exercise video sessions.
 * Anaemia is asked here so the answer is saved with the pathway choice.
 */
export default function CancerPathwayScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const review = isOnboardingReview(from);
  const savedCancerType = useAppStore((state) => state.cancerType);
  const savedAnaemia = useAppStore((state) => state.anaemiaDiagnosed);
  const setCancerType = useAppStore((state) => state.setCancerType);
  const setAnaemiaDiagnosed = useAppStore((state) => state.setAnaemiaDiagnosed);

  const initialSlug = useMemo(
    () => normalizeCancerTypeSlug(savedCancerType),
    [savedCancerType],
  );
  const [selected, setSelected] = useState<CancerTypeSlug | null>(initialSlug);
  const [anaemia, setAnaemia] = useState<boolean | null>(savedAnaemia);

  const canContinue = selected != null && anaemia != null;

  const handleContinue = () => {
    if (!selected || anaemia == null) return;
    setCancerType(selected);
    setAnaemiaDiagnosed(anaemia);
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
          {CANCER_TYPE_SLUGS.map((slug) => (
            <SelectOption
              key={slug}
              label={t(CANCER_TYPE_I18N_KEYS[slug])}
              selected={selected === slug}
              onPress={() => setSelected(slug)}
            />
          ))}
        </View>

        <View style={styles.anaemia}>
          <Text style={styles.anaemiaTitle}>{t('cancerPathway.anaemiaTitle')}</Text>
          <View style={styles.chipRow}>
            <Pressable
              onPress={() => setAnaemia(true)}
              style={[styles.chip, anaemia === true && styles.chipSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected: anaemia === true }}
            >
              <Text style={[styles.chipText, anaemia === true && styles.chipTextSelected]}>
                {t('cancerPathway.anaemiaYes')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setAnaemia(false)}
              style={[styles.chip, anaemia === false && styles.chipSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected: anaemia === false }}
            >
              <Text style={[styles.chipText, anaemia === false && styles.chipTextSelected]}>
                {t('cancerPathway.anaemiaNo')}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.advice}>{t('cancerPathway.anaemiaAdvice')}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={t('cancerPathway.continue')}
          onPress={handleContinue}
          disabled={!canContinue}
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
    paddingHorizontal: 32,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 20,
  },
  intro: {
    gap: 6,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimary,
    ...font('semiBold'),
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    ...font('regular'),
  },
  options: {
    gap: 12,
  },
  anaemia: {
    gap: 12,
  },
  anaemiaTitle: {
    ...uiText(16, 'semiBold'),
    color: colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chip: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  chipSelected: {
    backgroundColor: colors.optionBgSelected,
    borderWidth: 1.5,
    borderColor: colors.optionBorderSelected,
  },
  chipText: {
    ...uiText(15, 'medium'),
    textAlign: 'center',
    color: colors.textMuted,
  },
  chipTextSelected: {
    ...font('semiBold'),
    color: colors.optionTextSelected,
  },
  advice: {
    ...uiText(14),
    color: colors.textMuted,
  },
  footer: {
    paddingHorizontal: 32,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
});
