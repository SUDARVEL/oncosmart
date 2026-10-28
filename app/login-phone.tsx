import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import {
  formatIndiaPhone,
  phoneAuthErrorKey,
  savePatientPhone,
  sendPhoneOtp,
  toE164India,
  verifyPhoneOtp,
} from '../lib/phoneAuth';
import { routeAfterSignIn } from '../lib/routeAfterSignIn';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { font } from '../theme/fonts';
import { uiText } from '../theme/typography';

export default function PhoneLoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isReset = mode === 'reset';

  const [phoneInput, setPhoneInput] = useState('');
  const [sentPhone, setSentPhone] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showError = (message: string, errorCode?: string) => {
    setError(t(phoneAuthErrorKey(message, errorCode)));
  };

  const handleSend = async () => {
    const phone = toE164India(phoneInput);
    if (!phone) {
      setError(t('phoneLogin.invalidPhone'));
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await sendPhoneOtp(phone, { createUser: !isReset });
    setSubmitting(false);
    if (!result.ok) {
      showError(result.message, result.code);
      return;
    }
    setSentPhone(phone);
    setCode('');
  };

  const handleVerify = async () => {
    if (!sentPhone) return;
    const token = code.replace(/\D/g, '');
    if (token.length !== 6) {
      setError(t('phoneLogin.invalidCode'));
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await verifyPhoneOtp(sentPhone, token);
    if (!result.ok) {
      setSubmitting(false);
      showError(result.message, result.code);
      return;
    }

    const keptLanguage = useAppStore.getState().language;
    useAppStore.getState().resetApp();
    if (keptLanguage) useAppStore.getState().setLanguage(keptLanguage);
    if (result.userId) {
      await savePatientPhone(result.userId, sentPhone);
    }
    await routeAfterSignIn(router);
    setSubmitting(false);
  };

  const title = isReset ? t('phoneLogin.resetTitle') : t('phoneLogin.title');
  const subtitle = isReset ? t('phoneLogin.resetSubtitle') : t('phoneLogin.subtitle');

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="" showBack onBack={() => router.replace('/login')} />
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
              <Text style={styles.welcome}>{title}</Text>
              <Text style={styles.tagline}>{subtitle}</Text>
            </View>

            <View style={styles.form}>
              {sentPhone ? (
                <>
                  <Text style={styles.sent}>
                    {t('phoneLogin.sent', { phone: formatIndiaPhone(sentPhone) })}
                  </Text>
                  <Text style={styles.label}>{t('phoneLogin.codeLabel')}</Text>
                  <AppTextInput
                    value={code}
                    onChangeText={(value) => {
                      setCode(value.replace(/\D/g, '').slice(0, 6));
                      if (error) setError(null);
                    }}
                    placeholder={t('phoneLogin.codePlaceholder')}
                    keyboardType="number-pad"
                    maxLength={6}
                    returnKeyType="done"
                    onSubmitEditing={() => void handleVerify()}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.label}>{t('phoneLogin.phoneLabel')}</Text>
                  <AppTextInput
                    value={phoneInput}
                    onChangeText={(value) => {
                      setPhoneInput(value);
                      if (error) setError(null);
                    }}
                    placeholder={t('phoneLogin.phonePlaceholder')}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    returnKeyType="done"
                    onSubmitEditing={() => void handleSend()}
                  />
                </>
              )}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <PrimaryButton
                label={
                  submitting
                    ? sentPhone
                      ? t('phoneLogin.verifying')
                      : t('phoneLogin.sending')
                    : sentPhone
                      ? t('phoneLogin.verify')
                      : t('phoneLogin.sendCode')
                }
                onPress={() => void (sentPhone ? handleVerify() : handleSend())}
                disabled={submitting}
                style={styles.button}
              />

              {sentPhone ? (
                <View style={styles.links}>
                  <Pressable onPress={() => void handleSend()} disabled={submitting}>
                    <Text style={styles.link}>{t('phoneLogin.resend')}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setSentPhone(null);
                      setCode('');
                      setError(null);
                    }}
                  >
                    <Text style={styles.link}>{t('phoneLogin.changeNumber')}</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => router.replace('/login')} style={styles.usernameLink}>
                  <Text style={styles.link}>{t('phoneLogin.haveUsername')}</Text>
                </Pressable>
              )}
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
    lineHeight: 26,
    textAlign: 'center',
    ...font('semiBold'),
    color: '#262526',
  },
  tagline: {
    ...uiText(14),
    textAlign: 'center',
    color: '#4B5563',
  },
  form: {
    gap: 10,
  },
  label: {
    ...uiText(14, 'semiBold'),
    color: colors.textPrimary,
  },
  sent: {
    ...uiText(14),
    color: '#374151',
    textAlign: 'center',
    marginBottom: 6,
  },
  errorText: {
    ...uiText(13),
    color: '#DC2626',
  },
  button: {
    height: 48,
    marginTop: 8,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  usernameLink: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  link: {
    ...uiText(13, 'medium'),
    color: colors.buttonPrimary,
    textAlign: 'center',
  },
});
