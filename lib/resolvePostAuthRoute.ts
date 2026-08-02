import type { Session } from '@supabase/supabase-js';

import { isAdminSession } from './isAdmin';
import { isOnboardingComplete } from './isOnboardingComplete';
import { useAppStore } from '../store/useAppStore';

/** Where to send a signed-in user after splash/login/cloud hydrate. */
export function resolvePostAuthRoute(
  session?: Session | null,
): '/admin' | '/home' | '/onboarding' {
  if (isAdminSession(session)) return '/admin';
  const state = useAppStore.getState();
  return isOnboardingComplete(state) ? '/home' : '/onboarding';
}
