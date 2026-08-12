import type { Session } from '@supabase/supabase-js';

import { isAdminSession } from './isAdmin';
import { isOnboardingComplete } from './isOnboardingComplete';
import { useAppStore } from '../store/useAppStore';

/** Where to send a signed-in user after splash/login/cloud hydrate. */
export function resolvePostAuthRoute(
  session?: Session | null,
): '/admin' | '/home' | '/onboarding' {
  // Admins use the full patient exercise app; dashboard is reachable from Settings.
  if (isAdminSession(session)) return '/home';
  const state = useAppStore.getState();
  return isOnboardingComplete(state) ? '/home' : '/onboarding';
}
