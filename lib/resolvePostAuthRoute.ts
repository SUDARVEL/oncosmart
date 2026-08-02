import { isOnboardingComplete } from './isOnboardingComplete';
import { useAppStore } from '../store/useAppStore';

/** Where to send a signed-in user after splash/login/cloud hydrate. */
export function resolvePostAuthRoute(): '/home' | '/onboarding' {
  const state = useAppStore.getState();
  return isOnboardingComplete(state) ? '/home' : '/onboarding';
}
