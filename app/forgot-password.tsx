import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTextInput } from '../components/AppTextInput';
import { OncosmartLogo } from '../components/OncosmartLogo';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { signInWithUsername } from '../lib/auth';
import {
  confirmPasswordReset,
  sendPasswordResetCode,
  type RecoveryError,
} from '../lib/passwordRecovery';
import { routeAfterSignIn } from '../lib/routeAfterSignIn';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { font } from '../theme/fonts';
import { uiText } from '../theme/typography';

export default function ForgotPasswordScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showError = (codeName: RecoveryError) => {
    if (codeName === 'offline') {
      setError(null);
      return;
    }
    setError(t(`forgotPassword.errors.${codeName}`, { defaultValue: t('forgotPassword.errors.mail_failed') }));
  };

  const handleSend = async () => {
    setSubmitting(true);
    setError(null);
    const result = await sendPasswordResetCode(username, i18n.language);
    setSubmitting(false);
    if (!result.ok) {
      showError(result.error);
      return;
    }
    setSent(true);
  };

  const handleReset = async () => {
    if (password !== confirm) {
      setError(t('forgotPassword.mismatch'));
      return;
    }
    if (password.length < 8) {
      setError(t('forgotPassword.tooShort'));
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await confirmPasswordReset(username, code, password);
    if (!result.ok) {
      setSubmitting(false);
      showError(result.error);
      return;
    }

    const keptLanguage = useAppStore.getState().language;
    useAppStore.getState().resetApp();
    if (keptLanguage) useAppStore.getState().setLanguage(keptLanguage);
    const signedIn = await signInWithUsername(username, password);
    if (!signedIn.ok) {
      setSubmitting(false);
      router.replace('/login');
      return;
    }
    await routeAfterSignIn(router);
    setSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="" showBack onBack={() => router.replace('/login')} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.brandBlock}>
              <OncosmartLogo width={82} />
              <Text style={styles.welcome}>{t('forgotPassword.title')}</Text>
              <Text style={styles.tagline}>{t('forgotPassword.subtitle')}</Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>{t('forgotPassword.usernameLabel')}</Text>
              <AppTextInput
                value={username}
                onChangeText={(value) => {
                  setUsername(value);
                  setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!sent}
                placeholder={t('forgotPassword.usernamePlaceholder')}
              />

              {sent ? (
                <>
                  <Text style={styles.sent}>{t('forgotPassword.sent')}</Text>
                  <Text style={styles.label}>{t('forgotPassword.codeLabel')}</Text>
                  <AppTextInput
                    value={code}
                    onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                    keyboardType="number-pad"
                    placeholder={t('forgotPassword.codePlaceholder')}
                  />
                  <Text style={[styles.label, styles.labelGap]}>{t('forgotPassword.newLabel')}</Text>
                  <AppTextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    placeholder={t('forgotPassword.newPlaceholder')}
                  />
                  <Text style={[styles.label, styles.labelGap]}>{t('forgotPassword.confirmLabel')}</Text>
                  <AppTextInput
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry
                    autoCapitalize="none"
                    placeholder={t('forgotPassword.confirmPlaceholder')}
                  />
                </>
              ) : null}

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <PrimaryButton
                label={
                  submitting
                    ? t('forgotPassword.working')
                    : sent
                      ? t('forgotPassword.save')
                      : t('forgotPassword.send')
                }
                onPress={() => void (sent ? handleReset() : handleSend())}
                disabled={submitting || username.trim().length === 0}
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
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 12,
    paddingBottom: 96,
  },
  content: { gap: 28, maxWidth: 360, width: '100%', alignSelf: 'center' },
  brandBlock: { alignItems: 'center', gap: 8 },
  welcome: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    ...font('semiBold'),
    color: '#262526',
  },
  tagline: { ...uiText(14), textAlign: 'center', color: '#4B5563' },
  form: { gap: 10 },
  label: { ...uiText(14, 'semiBold'), color: colors.textPrimary },
  labelGap: { marginTop: 6 },
  sent: { ...uiText(14), color: '#374151', textAlign: 'center' },
  error: { ...uiText(13), color: '#DC2626' },
  button: { height: 48, marginTop: 8 },
});
