import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

const MIN_AGE = 1;
const MAX_AGE = 120;

function parseAgeInput(value: string): number | null {
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return null;
  const n = Number.parseInt(digits, 10);
  if (!Number.isFinite(n)) return null;
  return n;
}

export default function AgeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const savedAge = useAppStore((state) => state.age);
  const setAge = useAppStore((state) => state.setAge);
  const [ageText, setAgeText] = useState(
    savedAge != null && savedAge > 0 ? String(savedAge) : '',
  );

  const parsedAge = parseAgeInput(ageText);
  const canContinue =
    parsedAge != null && parsedAge >= MIN_AGE && parsedAge <= MAX_AGE;

  const handleChange = (value: string) => {
    setAgeText(value.replace(/[^\d]/g, '').slice(0, 3));
  };

  const handleContinue = () => {
    if (!canContinue || parsedAge == null) return;
    setAge(parsedAge);
    router.push('/onboarding/gender');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={t('age.header')} showBack largeTitle />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={styles.content}>
          <View style={styles.intro}>
            <Text style={styles.title}>{t('age.title')}</Text>
            <Text style={styles.subtitle}>{t('age.subtitle')}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('age.label')}</Text>
            <TextInput
              value={ageText}
              onChangeText={handleChange}
              placeholder={t('age.placeholder')}
              placeholderTextColor={colors.textPlaceholder}
              style={styles.input}
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={3}
              onSubmitEditing={handleContinue}
              accessibilityLabel={t('age.label')}
            />
          </View>

          <PrimaryButton
            label={t('age.continue')}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 28,
    marginTop: -40,
  },
  intro: {
    gap: 8,
  },
  title: {
    fontSize: 20,
    ...font('semiBold'),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    ...font('regular'),
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    ...font('regular'),
    color: colors.textPrimary,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 20,
    lineHeight: 26,
    ...font('regular'),
    color: colors.textPrimary,
    backgroundColor: colors.background,
    textAlign: 'center',
  },
});
