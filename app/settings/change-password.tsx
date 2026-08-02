import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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

import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAndroidBack } from '../../hooks/useAndroidBack';
import { changePassword } from '../../lib/auth';
import { goBackOr } from '../../lib/navBack';
import { markPasswordChanged } from '../../lib/userCloudSync';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { uiText } from '../../theme/typography';

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const activeAuthUserId = useAppStore((s) => s.activeAuthUserId);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    confirmPassword.length > 0 &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError(t('changePassword.mismatch'));
      return;
    }
    if (newPassword.length < 8) {
      setError(t('changePassword.tooShort'));
      return;
    }

    setSubmitting(true);
    const result = await changePassword(currentPassword, newPassword);
    if (result.ok && activeAuthUserId) {
      // Admin dashboard shows "password changed" — never the secret itself.
      await markPasswordChanged(activeAuthUserId);
    }
    setSubmitting(false);

    if (!result.ok) {
      setError(
        result.message === 'Current password is incorrect.'
          ? t('changePassword.wrongCurrent')
          : result.message,
      );
      return;
    }

    setSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleBack = useCallback(() => {
    goBackOr(() => router.replace('/settings'));
  }, [router]);

  useAndroidBack(
    useCallback(() => {
      handleBack();
      return true;
    }, [handleBack]),
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader
        title={t('changePassword.title')}
        showBack
        onBack={handleBack}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>{t('changePassword.subtitle')}</Text>

          <Text style={styles.label}>{t('changePassword.currentLabel')}</Text>
          <AppTextInput
            value={currentPassword}
            onChangeText={(v) => {
              setCurrentPassword(v);
              setError(null);
              setSuccess(false);
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={t('changePassword.currentPlaceholder')}
          />

          <Text style={[styles.label, styles.labelGap]}>{t('changePassword.newLabel')}</Text>
          <AppTextInput
            value={newPassword}
            onChangeText={(v) => {
              setNewPassword(v);
              setError(null);
              setSuccess(false);
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={t('changePassword.newPlaceholder')}
          />

          <Text style={[styles.label, styles.labelGap]}>
            {t('changePassword.confirmLabel')}
          </Text>
          <AppTextInput
            value={confirmPassword}
            onChangeText={(v) => {
              setConfirmPassword(v);
              setError(null);
              setSuccess(false);
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={t('changePassword.confirmPlaceholder')}
            onSubmitEditing={() => void handleSubmit()}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{t('changePassword.success')}</Text> : null}

          <PrimaryButton
            label={submitting ? t('changePassword.saving') : t('changePassword.save')}
            onPress={() => void handleSubmit()}
            disabled={!canSubmit}
            style={styles.button}
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 10,
  },
  subtitle: {
    ...uiText(14, 'regular'),
    color: colors.textSecondary,
    marginBottom: 12,
  },
  label: {
    ...uiText(14, 'semiBold'),
    color: colors.textPrimary,
  },
  labelGap: {
    marginTop: 10,
  },
  error: {
    marginTop: 8,
    ...uiText(13, 'regular'),
    color: '#DC2626',
  },
  success: {
    marginTop: 8,
    ...uiText(13, 'regular'),
    color: '#16A34A',
  },
  button: {
    marginTop: 16,
    height: 48,
  },
});
