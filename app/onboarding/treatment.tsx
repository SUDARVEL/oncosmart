import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { TreatmentType, useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

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
  /** Shorter surgery yes/no chips (Figma ~36–40). */
  compact?: boolean;
};

function ChoiceChip({ label, selected, onPress, compact = false }: ChoiceChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        styles.chipFlex,
        compact && styles.chipCompact,
        selected && styles.chipSelected,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text
        style={[styles.chipText, selected && styles.chipTextSelected]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Figma Treatment Details (2914:13055) — after gender, before avatar. */
export default function TreatmentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const savedCancerType = useAppStore((state) => state.cancerType);
  const savedTreatment = useAppStore((state) => state.treatmentUndergoing);
  const savedSurgery = useAppStore((state) => state.underwentSurgery);
  const setCancerType = useAppStore((state) => state.setCancerType);
  const setTreatmentUndergoing = useAppStore((state) => state.setTreatmentUndergoing);
  const setUnderwentSurgery = useAppStore((state) => state.setUnderwentSurgery);

  const [cancerType, setCancerTypeLocal] = useState(savedCancerType);
  const [treatment, setTreatmentLocal] = useState<TreatmentType | null>(savedTreatment);
  const [surgery, setSurgeryLocal] = useState<boolean | null>(savedSurgery);

  const trimmedCancer = cancerType.trim();
  const canContinue = trimmedCancer.length > 0 && treatment != null && surgery != null;

  const handleContinue = () => {
    if (!canContinue || treatment == null || surgery == null) return;
    setCancerType(trimmedCancer);
    setTreatmentUndergoing(treatment);
    setUnderwentSurgery(surgery);
    router.push('/onboarding/avatar');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title={t('treatment.header')} showBack largeTitle />

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
            <View style={styles.section}>
              <Text style={styles.label}>{t('treatment.cancerTypeLabel')}</Text>
              <TextInput
                value={cancerType}
                onChangeText={setCancerTypeLocal}
                placeholder={t('treatment.cancerTypePlaceholder')}
                placeholderTextColor={colors.textPlaceholder}
                style={styles.input}
                autoCapitalize="sentences"
                autoCorrect
                returnKeyType="done"
                accessibilityLabel={t('treatment.cancerTypeLabel')}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{t('treatment.treatmentLabel')}</Text>
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
              <Text style={styles.label}>{t('treatment.surgeryLabel')}</Text>
              <View style={styles.chipRow}>
                <ChoiceChip
                  label={t('treatment.yes')}
                  selected={surgery === true}
                  onPress={() => setSurgeryLocal(true)}
                  compact
                />
                <ChoiceChip
                  label={t('treatment.no')}
                  selected={surgery === false}
                  onPress={() => setSurgeryLocal(false)}
                  compact
                />
              </View>
            </View>

            <PrimaryButton
              label={t('treatment.continue')}
              onPress={handleContinue}
              disabled={!canContinue}
              style={styles.continueButton}
            />
          </View>
        </ScrollView>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
  },
  form: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    gap: 28,
  },
  section: {
    gap: 10,
  },
  label: {
    fontSize: 15,
    lineHeight: 22,
    ...font('medium'),
    color: '#00131F',
    letterSpacing: 0.1,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#E6E0E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    ...font('regular'),
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  chipCompact: {
    minHeight: 44,
    paddingVertical: 10,
  },
  chipFlex: {
    flexGrow: 1,
    flexBasis: 0,
  },
  chipSelected: {
    backgroundColor: colors.optionBgSelected,
    borderWidth: 1.5,
    borderColor: colors.optionBorderSelected,
  },
  chipText: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    ...font('medium'),
    color: colors.textMuted,
    letterSpacing: 0.1,
  },
  chipTextSelected: {
    ...font('semiBold'),
    color: colors.optionTextSelected,
  },
  continueButton: {
    marginTop: 4,
  },
});
