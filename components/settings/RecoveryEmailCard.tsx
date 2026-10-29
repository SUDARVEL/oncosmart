import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import {
  confirmRecoveryBind,
  loadRecoveryEmail,
  sendRecoveryBindCode,
  type RecoveryError,
} from '../../lib/passwordRecovery';
import { colors } from '../../theme/colors';
import { uiText } from '../../theme/typography';
import { AppTextInput } from '../AppTextInput';
import { PrimaryButton } from '../PrimaryButton';
import { SkeletonBlock } from '../ui/SkeletonBlock';

/** Email box shown directly on Settings. The code confirms the inbox before it is saved. */
export function RecoveryEmailCard() {
  const { t, i18n } = useTranslation();
  const [saved, setSaved] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailLoading, setEmailLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void loadRecoveryEmail().then((result) => {
      if (!alive) return;
      setSaved(result.email);
      if (result.email) setEmail(result.email);
      if (result.error === 'failed') setError(t('errors.loadFailed'));
      setEmailLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [t]);

  const showError = (codeName: RecoveryError) => {
    if (codeName === 'offline') {
      setError(null);
      return;
    }
    setError(
      t(`recoveryEmail.errors.${codeName}`, {
        defaultValue: t('recoveryEmail.errors.mail_failed'),
      }),
    );
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
    const next = email.trim().toLowerCase();
    setSaved(next);
    setEmail(next);
    setSuccess(true);
    setSent(false);
    setCode('');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t('settings.emailFieldLabel')}</Text>
      <Text style={styles.hint}>{t('settings.emailFieldHint')}</Text>
      {emailLoading ? (
        <SkeletonBlock height={48} radius={8} />
      ) : (
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
          placeholder={t('settings.emailFieldPlaceholder')}
        />
      )}
      {sent ? (
        <AppTextInput
          value={code}
          onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          placeholder={t('recoveryEmail.codePlaceholder')}
          style={styles.codeField}
        />
      ) : null}
      {saved && !sent ? <Text style={styles.saved}>{t('recoveryEmail.saved', { email: saved })}</Text> : null}
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.background,
  },
  label: {
    ...uiText(15, 'semiBold'),
    color: '#1E1E1E',
  },
  hint: {
    ...uiText(13),
    color: '#757575',
  },
  codeField: {
    marginTop: 4,
  },
  saved: {
    ...uiText(13),
    color: colors.textPrimary,
  },
  error: {
    ...uiText(13),
    color: '#DC2626',
  },
  success: {
    ...uiText(13),
    color: '#16A34A',
  },
  button: {
    height: 48,
    marginTop: 4,
  },
});
