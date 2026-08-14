import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { OncosmartLogo } from '../components/OncosmartLogo';
import { SplashFooter } from '../components/SplashFooter';
import { getCurrentSession } from '../lib/auth';
import { bootstrapAppData } from '../lib/bootstrapAppData';
import { isAdminSession } from '../lib/isAdmin';
import { getPreferredLanguage } from '../lib/preferredLanguage';
import { resolvePostAuthRoute } from '../lib/resolvePostAuthRoute';
import { syncNextExerciseNotification } from '../lib/nextExerciseNotification';
import { prepareAdminExerciseProfile } from '../lib/prepareAdminExerciseProfile';
import { loadCloudProfileIntoStore } from '../lib/userCloudSync';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

/** Short splash — keep the app feeling snappy. */
const SPLASH_DURATION_MS = 1200;

async function waitForStoreHydration(timeoutMs = 1500): Promise<void> {
  const persistApi = useAppStore.persist;
  if (persistApi.hasHydrated()) return;
  await Promise.race([
    new Promise<void>((resolve) => {
      persistApi.onFinishHydration(() => resolve());
    }),
    new Promise<void>((resolve) => {
      setTimeout(resolve, timeoutMs);
    }),
  ]);
}

export default function SplashScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const navigated = useRef(false);

  /**
   * Auth-first product flow:
   * - No session → Language → Login
   * - Session + onboarded patient → Home (no onboarding)
   * - Session + new patient → Onboarding (starts at username)
   * - Admin → Home (exercise app) + dashboard/testing from Settings
   */
  const proceed = useCallback(async () => {
    if (navigated.current) return;
    navigated.current = true;

    await bootstrapAppData();
    await waitForStoreHydration();

    const preferred = await getPreferredLanguage();
    if (preferred) {
      useAppStore.getState().setLanguage(preferred);
      if (i18n.language !== preferred) {
        void i18n.changeLanguage(preferred);
      }
    }

    const session = await getCurrentSession();
    if (!session?.user?.id) {
      // Always Language → Login when signed out (then onboarding only if new).
      const language = useAppStore.getState().language ?? preferred;
      useAppStore.getState().resetApp();
      if (language) useAppStore.getState().setLanguage(language);
      router.replace('/language');
      return;
    }

    if (isAdminSession(session)) {
      const language = useAppStore.getState().language ?? preferred;
      if (language) useAppStore.getState().setLanguage(language);
      // Keep AsyncStorage progress like patients — only reset on logout / account switch.
      await prepareAdminExerciseProfile(session, language);
      void syncNextExerciseNotification(useAppStore.getState().dayCompletedAt);
      router.replace('/home');
      return;
    }

    const cloud = await loadCloudProfileIntoStore(session.user.id);
    const completions = useAppStore.getState().dayCompletedAt;
    void syncNextExerciseNotification(completions);
    if (cloud.onboardingComplete) {
      router.replace('/home');
    } else {
      router.replace(resolvePostAuthRoute(session));
    }
  }, [i18n, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void proceed();
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [proceed]);

  return (
    <Pressable
      style={styles.pressable}
      onPress={() => void proceed()}
      accessibilityRole="button"
    >
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerContent}>
          <OncosmartLogo width={82} />
        </View>
        <SplashFooter />
      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
});
