import { useRouter } from 'expo-router';
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

import { OncosmartLogo } from '../components/OncosmartLogo';
import { PrimaryButton } from '../components/PrimaryButton';
import { signInWithUsername } from '../lib/auth';
import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = username.trim().length > 0 && password.length > 0 && !submitting;

  const handleSignIn = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const result = await signInWithUsername(username, password);
    if (result.ok) {
      router.replace('/onboarding');
      return;
    }
    setError(t('login.error'));
    setSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
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
              <Text style={styles.welcome}>{t('login.welcome')}</Text>
              <Text style={styles.tagline}>{t('login.tagline')}</Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>{t('login.usernameLabel')}</Text>
              <TextInput
                value={username}
                onChangeText={(v) => {
                  setUsername(v);
                  if (error) setError(null);
                }}
                placeholder={t('login.usernamePlaceholder')}
                placeholderTextColor={colors.textPlaceholder}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />

              <Text style={[styles.label, styles.labelSpacing]}>{t('login.passwordLabel')}</Text>
              <TextInput
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (error) setError(null);
                }}
                placeholder={t('login.passwordPlaceholder')}
                placeholderTextColor={colors.textPlaceholder}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <PrimaryButton
                label={submitting ? t('login.signingIn') : t('login.signIn')}
                onPress={handleSignIn}
                disabled={!canSubmit}
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
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
    ...font('semiBold'),
    color: '#262526',
    letterSpacing: 0.1,
  },
  tagline: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    ...font('semiBold'),
    color: '#262526',
    letterSpacing: 0.1,
  },
  form: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    ...font('semiBold'),
    color: colors.textPrimary,
  },
  labelSpacing: {
    marginTop: 6,
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
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#DC2626',
    ...font('regular'),
  },
  button: {
    height: 48,
    marginTop: 8,
  },
});
