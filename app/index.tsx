import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OncosmartLogo } from '../components/OncosmartLogo';
import { SplashFooter } from '../components/SplashFooter';
import { getCurrentSession } from '../lib/auth';
import { bootstrapAppData } from '../lib/bootstrapAppData';
import { isAdminSession } from '../lib/isAdmin';
import { resolvePostAuthRoute } from '../lib/resolvePostAuthRoute';
import { syncNextExerciseNotification } from '../lib/nextExerciseNotification';
import { loadCloudProfileIntoStore } from '../lib/userCloudSync';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

const SPLASH_DURATION_MS = 3000;

async function waitForStoreHydration(timeoutMs = 2500): Promise<void> {
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

  // Auth-first: no session → Login (never reuse a leftover local name).
  // Signed-in + onboarded → home; signed-in incomplete → onboarding; admin → admin.
  const proceed = useCallback(async () => {
    await bootstrapAppData();
    await waitForStoreHydration();

    const session = await getCurrentSession();
    if (!session?.user?.id) {
      useAppStore.getState().resetApp();
      router.replace('/login');
      return;
    }

    if (isAdminSession(session)) {
      useAppStore.getState().resetApp();
      router.replace('/admin');
      return;
    }

    await loadCloudProfileIntoStore(session.user.id);
    const completions = useAppStore.getState().dayCompletedAt;
    void syncNextExerciseNotification(completions);
    router.replace(resolvePostAuthRoute(session));
  }, [router]);

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
