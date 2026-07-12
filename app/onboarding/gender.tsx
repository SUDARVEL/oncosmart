import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SelectOption } from '../../components/SelectOption';
import { AppGender, useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

const GENDER_OPTIONS: { id: AppGender; labelKey: string }[] = [
  { id: 'male', labelKey: 'gender.male' },
  { id: 'female', labelKey: 'gender.female' },
  { id: 'prefer_not_to_say', labelKey: 'gender.preferNot' },
];

export default function GenderScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const savedGender = useAppStore((state) => state.gender);
  const setGender = useAppStore((state) => state.setGender);
  const [selected, setSelected] = useState<AppGender | null>(savedGender);

  const handleContinue = () => {
    if (!selected) return;
    setGender(selected);
    router.push('/onboarding/treatment');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={t('gender.header')} showBack />

      <View style={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.title}>{t('gender.title')}</Text>
          <Text style={styles.subtitle}>{t('gender.subtitle')}</Text>
        </View>

        <View style={styles.options}>
          {GENDER_OPTIONS.map((option) => (
            <SelectOption
              key={option.id}
              label={t(option.labelKey)}
              selected={selected === option.id}
              onPress={() => setSelected(option.id)}
            />
          ))}
        </View>

        <PrimaryButton
          label={t('gender.continue')}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
    marginTop: -24,
  },
  intro: {
    gap: 6,
    marginBottom: 8,
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
    marginBottom: 8,
  },
});
