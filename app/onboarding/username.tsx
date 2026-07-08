import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

export default function UsernameScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const returnToSettings = from === 'settings';
  const savedUsername = useAppStore((state) => state.username);
  const setUsername = useAppStore((state) => state.setUsername);
  const [name, setName] = useState(savedUsername);

  const trimmedName = name.trim();
  const canContinue = trimmedName.length > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    setUsername(trimmedName);
    if (returnToSettings) {
      router.replace('/settings');
      return;
    }
    router.push('/onboarding/age');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="" showBack />

      <View style={styles.content}>
        <View style={styles.brandBlock}>
          <Image
            source={require('../../assets/splash/oncosmart-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.welcome}>{t('username.welcome')}</Text>
          <Text style={styles.tagline}>{t('username.tagline')}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>{t('username.label')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('username.placeholder')}
            placeholderTextColor={colors.textPlaceholder}
            style={styles.input}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <PrimaryButton
            label={t('username.getStarted')}
            onPress={handleContinue}
            disabled={!canContinue}
          />
        </View>
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
    paddingHorizontal: 61,
    gap: 36,
    marginTop: -20,
  },
  brandBlock: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 82,
    height: 159,
  },
  welcome: {
    fontSize: 14,
    ...font('semiBold'),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    ...font('medium'),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    ...font('semiBold'),
    color: colors.textPrimary,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 14,
    ...font('regular'),
    color: colors.textPrimary,
    marginBottom: 8,
  },
});
