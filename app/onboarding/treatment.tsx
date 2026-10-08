import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { normalizeCancerTypeSlug } from '../../lib/cancerPathway';
import { isOnboardingReview, onboardingReviewHref } from '../../lib/onboardingReview';
import { TreatmentType, useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { uiText } from '../../theme/typography';

/** Figma Treatment Details — first row hugs content; second row splits evenly. */
const TREATMENT_ROW_PRIMARY: { id: TreatmentType; labelKey: string }[] = [
  { id: 'chemotherapy', labelKey: 'treatment.chemotherapy' },
  { id: 'radiation', labelKey: 'treatment.radiation' },
];

const TREATMENT_ROW_SECONDARY: { id: TreatmentType; labelKey: string }[] = [
  { id: 'both', labelKey: 'treatment.both' },
  { id: 'none', labelKey: 'treatment.none' },
];

type ChoiceChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
};

function ChoiceChip({ label, selected, onPress, compact = false }: ChoiceChipProps) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      style={[
        styles.chip,
        styles.chipFlex,
        compact && styles.chipCompact,
        selected && styles.chipSelected,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Treatment, surgery, and anaemia — cancer pathway is chosen on the previous screen. */
export default function TreatmentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const review = isOnboardingReview(from);
  const cancerType = useAppStore((state) => state.cancerType);
  const savedTreatment = useAppStore((state) => state.treatmentUndergoing);
  const savedSurgery = useAppStore((state) => state.underwentSurgery);
  const savedAnaemia = useAppStore((state) => state.anaemiaDiagnosed);
  const setTreatmentUndergoing = useAppStore((state) => state.setTreatmentUndergoing);
  const setUnderwentSurgery = useAppStore((state) => state.setUnderwentSurgery);
  const setAnaemiaDiagnosed = useAppStore((state) => state.setAnaemiaDiagnosed);

  const [treatment, setTreatmentLocal] = useState<TreatmentType | null>(savedTreatment);
  const [surgery, setSurgeryLocal] = useState<boolean | null>(savedSurgery);
  const [anaemia, setAnaemia] = useState<boolean | null>(savedAnaemia);

  const hasCancerPathway = normalizeCancerTypeSlug(cancerType) != null;
  const canContinue =
    hasCancerPathway && treatment != null && surgery != null && anaemia != null;

  const handleContinue = () => {
    if (!canContinue || treatment == null || surgery == null || anaemia == null) return;
    setTreatmentUndergoing(treatment);
    setUnderwentSurgery(surgery);
    setAnaemiaDiagnosed(anaemia);
    router.push(review ? onboardingReviewHref('/onboarding/avatar') : '/onboarding/avatar');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title={t('treatment.header')} showBack />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {!hasCancerPathway ? (
              <Text style={styles.warning}>{t('treatment.cancerPathwayRequired')}</Text>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.heading}>{t('treatment.treatmentLabel')}</Text>
              <View style={styles.chipRow}>
                {TREATMENT_ROW_PRIMARY.map((option) => (
                  <ChoiceChip
                    key={option.id}
                    label={t(option.labelKey)}
                    selected={treatment === option.id}
                    onPress={() => setTreatmentLocal(option.id)}
                  />
                ))}
              </View>
              <View style={styles.chipRow}>
                {TREATMENT_ROW_SECONDARY.map((option) => (
                  <ChoiceChip
                    key={option.id}
                    label={t(option.labelKey)}
                    selected={treatment === option.id}
                    onPress={() => setTreatmentLocal(option.id)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.heading}>{t('treatment.surgeryLabel')}</Text>
              <View style={styles.chipRow}>
                <ChoiceChip
                  label={t('treatment.yes')}
                  selected={surgery === true}
                  onPress={() => setSurgeryLocal(true)}
                />
                <ChoiceChip
                  label={t('treatment.no')}
                  selected={surgery === false}
                  onPress={() => setSurgeryLocal(false)}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.heading}>{t('cancerPathway.anaemiaTitle')}</Text>
              <View style={styles.chipRow}>
                <ChoiceChip
                  label={t('cancerPathway.anaemiaYes')}
                  selected={anaemia === true}
                  onPress={() => setAnaemia(true)}
                />
                <ChoiceChip
                  label={t('cancerPathway.anaemiaNo')}
                  selected={anaemia === false}
                  onPress={() => setAnaemia(false)}
                />
              </View>
              <Text style={styles.advice}>{t('cancerPathway.anaemiaAdvice')}</Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton
            label={t('treatment.continue')}
            onPress={handleContinue}
            disabled={!canContinue}
          />
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 16,
    paddingBottom: 16,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  section: {
    gap: 16,
  },
  heading: {
    ...uiText(20, 'semiBold'),
    color: colors.textPrimary,
  },
  warning: {
    ...uiText(14, 'regular'),
    color: '#B45309',
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: 16,
  },
  chip: {
    minHeight: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  chipCompact: {
    minHeight: 56,
    paddingVertical: 12,
  },
  chipFlex: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '45%',
  },
  chipSelected: {
    backgroundColor: colors.optionBgSelected,
    borderWidth: 1.5,
    borderColor: colors.optionBorderSelected,
  },
  chipText: {
    ...uiText(15, 'medium'),
    width: '100%',
    textAlign: 'center',
    color: colors.textMuted,
    letterSpacing: 0,
  },
  chipTextSelected: {
    color: colors.optionTextSelected,
  },
  advice: {
    ...uiText(14),
    color: colors.textMuted,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
});
