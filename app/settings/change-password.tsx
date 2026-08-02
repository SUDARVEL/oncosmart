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

import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { changePassword } from '../../lib/auth';
import { markPasswordChanged } from '../../lib/userCloudSync';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

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

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader
        title={t('changePassword.title')}
        showBack
        onBack={() => router.back()}
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
          <TextInput
            value={currentPassword}
            onChangeText={(v) => {
              setCurrentPassword(v);
              setError(null);
              setSuccess(false);
            }}
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={t('changePassword.currentPlaceholder')}
            placeholderTextColor={colors.textPlaceholder}
          />

          <Text style={[styles.label, styles.labelGap]}>{t('changePassword.newLabel')}</Text>
          <TextInput
            value={newPassword}
            onChangeText={(v) => {
              setNewPassword(v);
              setError(null);
              setSuccess(false);
            }}
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={t('changePassword.newPlaceholder')}
            placeholderTextColor={colors.textPlaceholder}
          />

          <Text style={[styles.label, styles.labelGap]}>
            {t('changePassword.confirmLabel')}
          </Text>
          <TextInput
            value={confirmPassword}
            onChangeText={(v) => {
              setConfirmPassword(v);
              setError(null);
              setSuccess(false);
            }}
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={t('changePassword.confirmPlaceholder')}
            placeholderTextColor={colors.textPlaceholder}
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
    gap: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 12,
    ...font('regular'),
  },
  label: {
    fontSize: 14,
    color: colors.textPrimary,
    ...font('semiBold'),
  },
  labelGap: {
    marginTop: 10,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    ...font('regular'),
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  error: {
    marginTop: 8,
    fontSize: 13,
    color: '#DC2626',
    ...font('regular'),
  },
  success: {
    marginTop: 8,
    fontSize: 13,
    color: '#16A34A',
    ...font('regular'),
  },
  button: {
    marginTop: 16,
    height: 48,
  },
});
