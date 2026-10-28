import type { Router } from 'expo-router';

import { getCurrentSession } from './auth';
import { isAdminSession } from './isAdmin';
import { syncNextExerciseNotification } from './nextExerciseNotification';
import { prepareAdminExerciseProfile } from './prepareAdminExerciseProfile';
import { loadCloudProfileIntoStore } from './userCloudSync';
import { useAppStore } from '../store/useAppStore';

/** Send a freshly signed-in patient or admin to Home or onboarding. */
export async function routeAfterSignIn(router: Router): Promise<void> {
  const keptLanguage = useAppStore.getState().language;
  const setLanguage = useAppStore.getState().setLanguage;
  const setActiveAuthUserId = useAppStore.getState().setActiveAuthUserId;
  const session = await getCurrentSession();

  if (isAdminSession(session) && session?.user?.id) {
    await prepareAdminExerciseProfile(session, keptLanguage);
    void syncNextExerciseNotification(useAppStore.getState().dayCompletedAt);
    router.replace('/home');
    return;
  }

  if (session?.user?.id) {
    setActiveAuthUserId(session.user.id);
    const cloud = await loadCloudProfileIntoStore(session.user.id);
    if (keptLanguage) setLanguage(keptLanguage);
    void syncNextExerciseNotification(useAppStore.getState().dayCompletedAt);
    router.replace(cloud.onboardingComplete ? '/home' : '/onboarding');
    return;
  }

  router.replace('/onboarding');
}
