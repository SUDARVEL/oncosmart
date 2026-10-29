import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAndroidBack } from '../../hooks/useAndroidBack';
import { goBackOr } from '../../lib/navBack';
import {
  confirmRecoveryBind,
  loadRecoveryEmail,
  sendRecoveryBindCode,
  type RecoveryError,
} from '../../lib/passwordRecovery';
import { colors } from '../../theme/colors';
import { uiText } from '../../theme/typography';

export default function RecoveryEmailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [saved, setSaved] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let alive = true;
    void loadRecoveryEmail().then((result) => {
      if (!alive) return;
      setSaved(result.email);
      if (result.email) setEmail(result.email);
      if (result.error === 'offline') setError(t('errors.offline'));
      else if (result.error === 'failed') setError(t('errors.loadFailed'));
    });
    return () => {
      alive = false;
    };
  }, [t]);

  const handleBack = useCallback(() => {
    goBackOr(() => router.replace('/settings'));
  }, [router]);

  useAndroidBack(
    useCallback(() => {
      handleBack();
      return true;
    }, [handleBack]),
  );

  const showError = (codeName: RecoveryError) => {
    setError(t(`recoveryEmail.errors.${codeName}`, { defaultValue: t('recoveryEmail.errors.mail_failed') }));
  };

  const handleSend = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    const result = await sendRecoveryBindCode(email, i18n.language);
    setSubmitting(false);
    if (!result.ok) {
      showError(result.error);
      return;
    }
    setSent(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    const result = await confirmRecoveryBind(email, code);
    setSubmitting(false);
    if (!result.ok) {
      showError(result.error);
      return;
    }
    setSaved(email.trim().toLowerCase());
    setSuccess(true);
    setSent(false);
    setCode('');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title={t('recoveryEmail.title')} showBack onBack={handleBack} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>{t('recoveryEmail.subtitle')}</Text>
          {saved ? <Text style={styles.saved}>{t('recoveryEmail.saved', { email: saved })}</Text> : null}

          <Text style={styles.label}>{t('recoveryEmail.emailLabel')}</Text>
          <AppTextInput
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setSent(false);
              setError(null);
              setSuccess(false);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder={t('recoveryEmail.emailPlaceholder')}
          />

          {sent ? (
            <>
              <Text style={[styles.label, styles.labelGap]}>{t('recoveryEmail.codeLabel')}</Text>
              <AppTextInput
                value={code}
                onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                placeholder={t('recoveryEmail.codePlaceholder')}
              />
            </>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{t('recoveryEmail.success')}</Text> : null}

          <PrimaryButton
            label={
              submitting
                ? t('recoveryEmail.working')
                : sent
                  ? t('recoveryEmail.confirm')
                  : t('recoveryEmail.send')
            }
            onPress={() => void (sent ? handleConfirm() : handleSend())}
            disabled={submitting || email.trim().length < 5}
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, gap: 10 },
  subtitle: { ...uiText(14), color: colors.textSecondary, marginBottom: 8 },
  saved: { ...uiText(14, 'semiBold'), color: colors.textPrimary },
  label: { ...uiText(14, 'semiBold'), color: colors.textPrimary },
  labelGap: { marginTop: 10 },
  error: { ...uiText(13), color: '#DC2626' },
  success: { ...uiText(13), color: '#16A34A' },
  button: { marginTop: 16, height: 48 },
});
