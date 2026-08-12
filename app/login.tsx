import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { getCurrentSession, signInWithUsername } from '../lib/auth';
import { isAdminSession } from '../lib/isAdmin';
import { getPreferredLanguage } from '../lib/preferredLanguage';
import { openWhatsAppForgotPassword } from '../lib/openWhatsAppSupport';
import { syncNextExerciseNotification } from '../lib/nextExerciseNotification';
import { prepareAdminExerciseProfile } from '../lib/prepareAdminExerciseProfile';
import { loadCloudProfileIntoStore } from '../lib/userCloudSync';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { font } from '../theme/fonts';
import { uiText } from '../theme/typography';

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const resetApp = useAppStore((state) => state.resetApp);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const setActiveAuthUserId = useAppStore((state) => state.setActiveAuthUserId);
  const language = useAppStore((state) => state.language);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Language must be chosen before Login.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (language) return;
      const preferred = await getPreferredLanguage();
      if (cancelled) return;
      if (preferred) {
        setLanguage(preferred);
        if (i18n.language !== preferred) void i18n.changeLanguage(preferred);
        return;
      }
      router.replace('/language');
    })();
    return () => {
      cancelled = true;
    };
  }, [i18n, language, router, setLanguage]);

  const canSubmit = username.trim().length > 0 && password.length > 0 && !submitting;

  const handleSignIn = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    // Clear previous account cache but keep the pre-login language choice.
    const keptLanguage = useAppStore.getState().language;
    resetApp();
    if (keptLanguage) setLanguage(keptLanguage);

    const result = await signInWithUsername(username, password);
    if (!result.ok) {
      setError(t('login.error'));
      setSubmitting(false);
      return;
    }

    const session = await getCurrentSession();
    if (isAdminSession(session) && session?.user?.id) {
      // Admin gets the full exercise app + dashboard/testing tools from Settings.
      await prepareAdminExerciseProfile(session, keptLanguage);
      void syncNextExerciseNotification(useAppStore.getState().dayCompletedAt);
      router.replace('/home');
      setSubmitting(false);
      return;
    }
    if (session?.user?.id) {
      // Bind sync immediately so onboarding/progress start uploading right away.
      setActiveAuthUserId(session.user.id);
      const cloud = await loadCloudProfileIntoStore(session.user.id);
      // Keep the language chosen before login for this device session.
      if (keptLanguage) setLanguage(keptLanguage);
      void syncNextExerciseNotification(useAppStore.getState().dayCompletedAt);

      // Trust cloud onboarding_complete so returning users always skip onboarding.
      if (cloud.onboardingComplete) {
        router.replace('/home');
      } else {
        router.replace('/onboarding');
      }
      setSubmitting(false);
      return;
    }
    router.replace('/onboarding');
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
              <AppTextInput
                value={username}
                onChangeText={(v) => {
                  setUsername(v);
                  if (error) setError(null);
                }}
                placeholder={t('login.usernamePlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />

              <Text style={[styles.label, styles.labelSpacing]}>{t('login.passwordLabel')}</Text>
              <AppTextInput
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (error) setError(null);
                }}
                placeholder={t('login.passwordPlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                onPress={() => void openWhatsAppForgotPassword(username)}
                accessibilityRole="link"
                style={styles.forgotWrap}
              >
                <Text style={styles.forgotText}>{t('login.forgotPassword')}</Text>
              </Pressable>

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
    ...uiText(14, 'semiBold'),
    color: colors.textPrimary,
  },
  labelSpacing: {
    marginTop: 6,
  },
  errorText: {
    ...uiText(13, 'regular'),
    color: '#DC2626',
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 13,
    ...font('medium'),
    color: colors.buttonPrimary,
  },
  button: {
    height: 48,
    marginTop: 8,
  },
});
