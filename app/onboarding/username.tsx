import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OncosmartLogo } from '../../components/OncosmartLogo';
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
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="" showBack />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            <View style={styles.brandBlock}>
              <OncosmartLogo width={82} />
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
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
              <PrimaryButton
                label={t('username.getStarted')}
                onPress={handleContinue}
                disabled={!canContinue}
                style={styles.button}
              />
            </View>
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
    paddingHorizontal: 40,
    paddingTop: 12,
    // Push the centered block a little above true center so keyboard leaves room
    paddingBottom: 96,
  },
  content: {
    gap: 28,
    maxWidth: 360,
    width: '100%',
    alignSelf: 'center',
  },
  brandBlock: {
    alignItems: 'center',
    gap: 8,
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
    gap: 10,
  },
  label: {
    fontSize: 14,
    ...font('semiBold'),
    color: colors.textPrimary,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    lineHeight: 20,
    ...font('regular'),
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  button: {
    height: 48,
    marginTop: 4,
  },
});
