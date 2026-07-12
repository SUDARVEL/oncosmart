import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SelectOption } from '../../components/SelectOption';
import { AgeRange, useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

const AGE_OPTIONS: { id: AgeRange; labelKey: string }[] = [
  { id: '18-24', labelKey: 'age.range18_24' },
  { id: '25-34', labelKey: 'age.range25_34' },
  { id: '35-44', labelKey: 'age.range35_44' },
  { id: '45-54', labelKey: 'age.range45_54' },
  { id: '55-64', labelKey: 'age.range55_64' },
];

export default function AgeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const savedAge = useAppStore((state) => state.ageRange);
  const setAgeRange = useAppStore((state) => state.setAgeRange);
  const [selected, setSelected] = useState<AgeRange | null>(savedAge);

  const handleContinue = () => {
    if (!selected) return;
    setAgeRange(selected);
    router.push('/onboarding/gender');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={t('age.header')} showBack />

      <View style={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.title}>{t('age.title')}</Text>
          <Text style={styles.subtitle}>{t('age.subtitle')}</Text>
        </View>

        <View style={styles.options}>
          {AGE_OPTIONS.map((option) => (
            <SelectOption
              key={option.id}
              label={t(option.labelKey)}
              selected={selected === option.id}
              onPress={() => setSelected(option.id)}
            />
          ))}
        </View>

        <PrimaryButton
          label={t('age.continue')}
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
  // Enlarge age options slightly for easier reading/tapping
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 20,
    marginTop: -40,
  },
  intro: {
    gap: 6,
  },
  title: {
    fontSize: 18,
    ...font('semiBold'),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    ...font('medium'),
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  options: {
    gap: 14,
  },
});
