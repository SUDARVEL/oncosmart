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

const TREATMENT_OPTIONS: { id: TreatmentType; labelKey: string }[] = [
  { id: 'chemotherapy', labelKey: 'treatment.chemotherapy' },
  { id: 'radiation', labelKey: 'treatment.radiation' },
  { id: 'both', labelKey: 'treatment.both' },
  { id: 'none', labelKey: 'treatment.none' },
];

type ChoiceChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  flex?: boolean;
};

function ChoiceChip({ label, selected, onPress, flex = true }: ChoiceChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, flex && styles.chipFlex, selected && styles.chipSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Figma Treatment Details — after gender, before avatar. */
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
            <View style={styles.grid}>
              {TREATMENT_OPTIONS.map((option) => (
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
            <View style={styles.row}>
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

          <PrimaryButton
            label={t('treatment.continue')}
            onPress={handleContinue}
            disabled={!canContinue}
            style={styles.continueButton}
          />
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
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 28,
    justifyContent: 'center',
  },
  section: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
    ...font('medium'),
    color: colors.textSecondary,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    lineHeight: 24,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    ...font('regular'),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  chip: {
    minHeight: 56,
    borderRadius: 10,
    backgroundColor: colors.optionBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  chipFlex: {
    flexGrow: 1,
    flexBasis: '47%',
  },
  chipSelected: {
    backgroundColor: colors.optionBgSelected,
    borderWidth: 1.5,
    borderColor: colors.optionBorderSelected,
  },
  chipText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    ...font('regular'),
    color: colors.textPrimary,
  },
  chipTextSelected: {
    ...font('semiBold'),
    color: colors.optionTextSelected,
  },
  continueButton: {
    marginTop: 8,
    height: 52,
  },
});
